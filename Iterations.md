# Iterations: Cooper Hewitt API Integration

Notes on API integration challenges, design decisions, and tradeoffs we considered. Handy reference for understanding how CHVisualizer was built to work with the Cooper Hewitt Collections API.

---

## Design & Editorial Decisions

### Curated categories vs raw classifications vs departments

**The problem:** The API exposes thousands of classification values (e.g. "knotted, knitted and crocheted textiles", "printed, dyed & painted textiles"). Raw classifications are too granular for a readable legend. Departments (Drawings/Prints, Product Design, etc.) are too coarse and heavily skewed toward certain eras.

**What we did:** Use the API's classification strings as the source of truth, map them to URL-safe slugs, and add an "other" bucket for anything that doesn't match. We keep ~50 distinct categories so the legend stays scannable. When classification is missing, we fall back to department (e.g. "product design" → furniture, "textile" → woven-textiles). This is an editorial call: we're choosing how to present the data, not just mirroring it.

### "Other" category: no API filter

**The tradeoff:** "Other" is a catch-all for objects whose classification doesn't match our list. There's no API parameter to filter by "other" because it's a client-side concept. So when the user selects "other", we fetch the base collection and filter client-side. If a page has few "other" items, we fetch additional pages (up to 20) to fill the grid. We could have avoided this by excluding "other" from the filter UI, but we wanted users to see and explore those objects too.

### Date parsing: handling messy museum data

**The problem:** Museum dates come as "1880–90", "19th century", "ca. 1925", "n.d.", etc. We need a sortable numeric year for the timeline.

**Decisions:**
- Century ("19th century") → midpoint 1850, range 1800–1899
- Decade ("1920s") → midpoint 1925, range 1920–1929
- Undated / n.d. → `year: null`, sorted last (we use 9999 internally for sort order)
- Keep the raw string for display so users see "ca. 1880" not "1880"

We tried to avoid over-interpreting; when in doubt, we preserve the original.

### Page size: 250

**Tradeoff:** Smaller pages = more requests and more rate-limit risk. Larger pages = fewer requests but we hit the Elasticsearch 10K window sooner (40 pages × 250 = 10K max). 250 felt like a good balance: enough to fill the grid, not so many that we burn through the 10K limit too fast. It also keeps individual responses small enough for snappy loading.

### Cache duration: 5 minutes

**Why short?** Chronological sort is critical. If we cached longer, users could see stale data from before we added sort, or from a different request shape. 5 min cuts down redundant Cooper Hewitt calls without risking confusing out-of-order results.

### DOM over canvas

**Tradeoff:** 250 small divs render fine in modern browsers. Canvas would be faster at 10K+ elements but adds manual hit testing, no built-in accessibility, and imperative rendering. For 250 items per page, DOM was simpler and "good enough." We'd revisit canvas if we ever tried to show the full 215K collection in one view.

### Normalization layer: UI never sees the API

**Why:** The Cooper Hewitt API returns deeply nested, inconsistent data (titles as typed arrays, dates as ambiguous strings, classifications as nested objects). Rather than letting that leak into the UI, we normalize everything into a flat model. The UI only ever sees `NormalizedObject`. If we swapped to a different data source (e.g. the Cooper Hewitt GitHub dump), we'd only touch the fetch and normalize layers. The presentation layer wouldn't need to change.

### Category filter: `general` parameter

When filtering by category, we pass the classification string as the `general` parameter. The API does a text search, so it's not a strict filter, but it biases results toward that category. For "other" we pass nothing and filter client-side, since there's no way to ask the API for "everything that doesn't match our classification list."

---

## Chronological Sorting: Sort Argument Format

### Requirement

We needed the collection in chronological order (earliest to latest) so the timeline slider could jump to the page with objects from a given era.

### Error Encountered

When we added sort to the GraphQL query using an inline literal:

```graphql
object(size: $size, page: $page, general: $general, sort: [{ creationYear: "asc" }])
```

The API returned:

```
Argument 'sort' has invalid value [{creationYear: "asc"}].
```

### Root Cause

The Cooper Hewitt API’s `sort` argument expects a `[GenericScalar]` type. Passing the sort value as an inline literal in the query string got rejected by the API’s validation layer.

### Fix

We pass `sort` as a GraphQL variable instead of an inline literal:

1. **Query definition**: Declare `$sort` as a variable and use it in the query:

   ```graphql
   query GetCollection($page: Int!, $size: Int!, $general: String, $sort: [GenericScalar]) {
     object(size: $size, page: $page, general: $general, sort: $sort) {
       ...
     }
   }
   ```

2. **Variables**: Pass the sort value in the `variables` object:

   ```json
   {
     "page": 1,
     "size": 250,
     "sort": [{ "creationYear": "asc" }]
   }
   ```

With that, the API accepts the sort parameter and returns results in chronological order.

---

## Sort Field: `creationYear` vs `year`

### Discovery

The API docs mention sorting by `year`, but the schema validation rejects `year` and returns:

```
year is not a valid key! Please use these keys: ['id', 'summary', 'creationYear']
```

### Resolution

We use `creationYear` instead of `year` for sorting. The sort value is `[{ creationYear: "asc" }]` (or `"desc"` for reverse order).

---

## Result Window Limit (Elasticsearch)

### Error Encountered

When requesting page 101 (or any page beyond 40), the API returned:

```
RequestError(400, 'search_phase_execution_exception', 'Result window is too large, 
from + size must be less than or equal to: [10000] but was [25500]. 
See the scroll api for a more efficient way to request large data sets. 
This limit can be set by changing the [index.max_result_window] index level setting.')
```

### Root Cause

The Cooper Hewitt API is backed by Elasticsearch, which enforces a default `index.max_result_window` of 10,000. So:

The API uses **0-based** page numbers: `from` = page × size. That means:

- API page 39 → `from` = 9,750, `from + size` = 10,000 ✓
- API page 40 → `from` = 10,000, `from + size` = 10,250 ✗ (exceeds limit)

Max accessible API page = 39 (0-based), i.e. **40 pages total**.

### Fix

Our app uses **1-based** pages (1–40). We convert to 0-based when calling the API: `pageZeroBased = pageOneBased - 1`.

We enforce the limit in three places:

1. **`/api/collection` route**: Cap the requested page to 40 (1-based) before fetching.
2. **`lib/api.ts`**: Convert 1-based to 0-based before calling the Cooper Hewitt API, so we never pass page > 39.
3. **Pagination in response**: We override the API’s pagination so the client never sees more than 40 pages:
   - `hits` is capped at 10,000 (so the client computes `totalPages` = 40)
   - `number_of_pages` is capped at 40

That keeps the timeline slider and page navigator within the accessible range and avoids errors when users hit the last page.

---

## Summary

| Item | API Expectation | Our Implementation |
|------|-----------------|---------------------|
| Sort argument | Passed as GraphQL variable | `sort: $sort` with `$sort: [GenericScalar]` |
| Sort field | `creationYear` (not `year`) | `[{ creationYear: "asc" }]` |
| Variable type | `[GenericScalar]` | JSON object array in variables |
| Result window | `from + size` ≤ 10,000 | Cap page to 40, cap pagination in response |
| Page indexing | 0-based (API) | Convert 1-based → 0-based in `lib/api.ts` |

---

## Chronological Ordering: How It Works

### We fetch sorted results from the API

We're **not** fetching random pages and sorting client-side. We request chronologically sorted results directly from Cooper Hewitt:

- Every collection request includes `sort: [{ creationYear: "asc" }]`
- Page 1 (our app) = API page 0 = first 250 items by `creationYear` ascending
- Page 40 = API page 39 = items 9,751–10,000 in chronological order

The Cooper Hewitt API applies the sort server-side before pagination. The timeline slider maps position to page number within this pre-sorted result set.

### Client-side sort

We also sort each page's 250 items client-side by `date.year` as a fallback. This doesn't change which page we fetch; it only reorders items within the page if the API returns them out of order.

### Caching and stale data

If you see mid-19th century items when the slider is at "earliest" (far left), it's usually **stale cached responses** from before sort was applied or from a different request. We use `cache: "no-store"` on collection fetches and a shorter server cache (5 min) to reduce this.

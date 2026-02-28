# CHVisualizer

A data visualization of the Cooper Hewitt Smithsonian Design Museum's collection (~215,000 objects). You get a full-screen grid of small circles; each one represents an object, color-coded by category and shaped by continent of origin, organized chronologically. Click a circle to view details, use the legend to filter by category, and paginate through the collection.

## Setup

### Prerequisites

- Node.js 18+ (LTS is a safe bet)

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app hits the Cooper Hewitt API live. No API key needed. Rate limits apply, so we use 250 objects per page to keep requests down.

## Design Decisions

### 1. Data normalization as the core concern

The Cooper Hewitt API returns deeply nested, inconsistent data (titles as typed arrays, dates as ambiguous strings, classifications as nested objects). The normalization layer flattens this into a predictable model the UI can use without caring about the API shape.

### 2. Categories and continents

We use Cooper Hewitt's ~50 classification values as our categories (furniture, graphic design, ceramics, etc.), converting them to URL-safe slugs. Objects that don't match a known classification fall into "other," with a department-based fallback for common cases. Each category gets a color from a palette. We also encode continent of origin via shape (circle = Europe, square = Asia, triangle = Africa, etc.) so each circle conveys both type and geography.

### 3. Robust date parsing

Museum dates are notoriously messy. The parser handles simple years, ranges, approximate dates, centuries, decades, and missing data, extracting a sortable numeric year while keeping the original string for display.

### 4. Three-layer architecture

Strict separation between:

- **Data fetching** (API proxy): talks to Cooper Hewitt, returns raw typed responses
- **Normalization**: transforms messy API data into a clean internal model
- **Presentation**: renders normalized data only; no knowledge of the API shape

Swapping the data source would only require changes in the fetch and normalize layers.

### 5. API proxy route

Next.js API routes proxy requests to Cooper Hewitt, avoiding CORS issues. We use HTTP caching (5 min via Cache-Control) so the browser can cache responses per URL—no server-side cache, so each request that hits our server triggers a Cooper Hewitt call.

### 6. Pagination limits

Cooper Hewitt's API uses Elasticsearch, which defaults to `index.max_result_window=10000`. That limits how far you can paginate: with 250 per page, we cap at page 40. We clamp requested pages and pagination metadata so the client never sees or requests invalid pages. Objects beyond the first 10,000 are not reachable via this pagination.

### 7. DOM over canvas

250 small divs render comfortably in modern browsers. Canvas would be faster at 10,000+ elements but adds complexity (manual hit testing, no accessibility, imperative rendering) that didn't seem worth it for this scope.

## What I'd Improve With More Time

- Canvas rendering for the circle grid to handle the full 215K collection in one view
- Keyboard navigation and ARIA labels for accessibility
- Zod schema validation on API responses for runtime type safety
- Data source abstraction: support both live API and the Cooper Hewitt GitHub data dump
- Pre-fetching adjacent pages for faster navigation
- Error boundary components for graceful failure isolation
- Text search within the visualization (category filtering already exists)

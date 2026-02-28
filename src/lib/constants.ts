/** Items per page for collection pagination. Must match Cooper Hewitt API expectations. */
export const ITEMS_PER_PAGE = 250;

/** Cooper Hewitt API uses Elasticsearch with index.max_result_window=10000.
 *  With 250 per page: max page = 10000/250 = 40. Requests beyond this fail. */
export const MAX_RESULT_WINDOW = 10_000;

export const MAX_ACCESSIBLE_PAGE = Math.floor(MAX_RESULT_WINDOW / ITEMS_PER_PAGE);

/** Max pages to fetch when client-filtering "other" category (no API filter). */
export const MAX_PAGES_TO_FETCH_FOR_CATEGORY = 20;

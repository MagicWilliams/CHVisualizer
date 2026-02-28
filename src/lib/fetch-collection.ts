import type { NormalizedObject } from "@/types/normalized";
import type { RawObject } from "@/types/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { normalizeObjects, sortObjectsByYear } from "@/lib/normalize";

export interface CollectionPageData {
  objects: NormalizedObject[];
  totalPages: number;
}

interface CollectionApiResponse {
  objects?: unknown[];
  object?: unknown[];
  extensions?: { pagination?: { hits?: number } };
}

/** Parse collection API response - supports both `objects` (normalized) and `object` (raw). */
function parseCollectionResponse(data: CollectionApiResponse): NormalizedObject[] {
  const arr = data?.objects ?? data?.object ?? [];
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const first = arr[0] as Record<string, unknown>;
  if (first && typeof first.category === "string" && "categoryLabel" in first) {
    return sortObjectsByYear(arr as NormalizedObject[]);
  }
  return sortObjectsByYear(normalizeObjects(arr as RawObject[]));
}

/** Fetch a collection page from the API. Used by SWR. */
export async function fetchCollectionPage(
  page: number,
  category: string | null
): Promise<CollectionPageData> {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);

  const res = await fetch(`/api/collection?${params}`);
  const data: CollectionApiResponse = await res.json();

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please wait a moment before trying again."
      );
    }
    throw new Error((data as { error?: string }).error || "Failed to fetch collection");
  }

  const objects = parseCollectionResponse(data);
  const total = data.extensions?.pagination?.hits ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / ITEMS_PER_PAGE) : 1;

  return { objects, totalPages };
}

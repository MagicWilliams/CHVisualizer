import { NextRequest, NextResponse } from "next/server";
import { fetchCollectionPage } from "@/lib/api";
import {
  getCategorySearchTerm,
  VALID_CATEGORY_SLUGS,
} from "@/lib/categories";
import {
  MAX_ACCESSIBLE_PAGE,
  MAX_RESULT_WINDOW,
} from "@/lib/constants";
import { normalizeObjects } from "@/lib/normalize";
import { getErrorMessage } from "@/lib/utils";
import type { VisualCategory } from "@/types/normalized";

export async function GET(request: NextRequest) {
  const pageParam = request.nextUrl.searchParams.get("page");
  const categoryParam = request.nextUrl.searchParams.get("category");
  let page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  page = Math.min(page, MAX_ACCESSIBLE_PAGE);

  const category =
    categoryParam && VALID_CATEGORY_SLUGS.includes(categoryParam as VisualCategory)
      ? (categoryParam as VisualCategory)
      : null;
  const searchTerm = category ? getCategorySearchTerm(category) : null;

  try {
    const { objects, pagination } = await fetchCollectionPage(page, searchTerm);
    const normalized = normalizeObjects(objects);

    // Cap pagination so client never requests pages beyond Elasticsearch limit
    const cappedPagination = pagination
      ? {
          ...pagination,
          hits: Math.min(pagination.hits ?? 0, MAX_RESULT_WINDOW),
          number_of_pages: Math.min(
            pagination.number_of_pages ?? Infinity,
            MAX_ACCESSIBLE_PAGE,
          ),
        }
      : undefined;

    const response = NextResponse.json({
      objects: normalized,
      extensions: cappedPagination ? { pagination: cappedPagination } : undefined,
    });

    // private = no CDN cache (avoids same response for all pages when CDN ignores query string)
    // max-age=300 = browser can cache per URL for 5 min
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, must-revalidate"
    );

    return response;
  } catch (err) {
    const message = getErrorMessage(err);
    const status = (err as { response?: { status?: number } })?.response?.status;
    const is429 =
      status === 429 || message.includes("429") || message.includes("rate limit");

    if (is429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message || "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import type { NormalizedObject, VisualCategory, Continent } from '@/types/normalized';
import { CircleGrid } from '@/components/CircleGrid';
import { Legend } from '@/components/Legend';
import { PageNavigator } from '@/components/PageNavigator';
import { TimelineSlider } from '@/components/TimelineSlider';
import {
  getCategoryLabel,
  getCategorySearchTerm,
  VALID_CATEGORY_SLUGS,
} from '@/lib/categories';
import { fetchCollectionPage } from '@/lib/fetch-collection';
import {
  ITEMS_PER_PAGE,
  MAX_PAGES_TO_FETCH_FOR_CATEGORY,
} from '@/lib/constants';
import { CONTINENTS } from '@/lib/continents';

const INITIAL_COUNTS: Record<VisualCategory, number> = Object.fromEntries(
  VALID_CATEGORY_SLUGS.map(c => [c, 0]),
) as Record<VisualCategory, number>;

function computeCounts(
  objects: NormalizedObject[],
): Record<VisualCategory, number> {
  const counts = { ...INITIAL_COUNTS };
  for (const obj of objects) {
    counts[obj.category]++;
  }
  return counts;
}

const INITIAL_CONTINENT_COUNTS: Record<Continent, number> = Object.fromEntries(
  CONTINENTS.map((c) => [c, 0]),
) as Record<Continent, number>;

function computeContinentCounts(
  objects: NormalizedObject[],
): Record<Continent, number> {
  const counts = { ...INITIAL_CONTINENT_COUNTS };
  for (const obj of objects) {
    const c = obj.continent ?? 'unknown';
    counts[c] = (counts[c] ?? 0) + 1;
  }
  return counts;
}

function getYearRange(objects: NormalizedObject[]): string | undefined {
  const years = objects
    .map(o => o.date.year)
    .filter((y): y is number => y != null);
  if (years.length === 0) return undefined;
  const min = Math.min(...years);
  const max = Math.max(...years);
  return `${min}–${max}`;
}

type CollectionKey = [string, number, string | null];

const collectionFetcher = ([, page, category]: CollectionKey) =>
  fetchCollectionPage(page, category);

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<VisualCategory | null>(null);
  const [categoryPage, setCategoryPage] = useState(1);

  const categorySearchTerm = selectedCategory
    ? getCategorySearchTerm(selectedCategory)
    : null;
  const categoryHasApiFilter = categorySearchTerm !== null;

  // Reset category page when switching categories
  useEffect(() => {
    if (selectedCategory) setCategoryPage(1);
  }, [selectedCategory]);

  // Fetch base collection (for "all" and "other" category)
  const needsBaseData = selectedCategory === null || selectedCategory === 'other';
  const baseSwr = useSWR(
    needsBaseData ? (['collection', page, null] as CollectionKey) : null,
    collectionFetcher,
    { revalidateOnFocus: false }
  );

  // Fetch category-filtered collection (when API supports it)
  const needsCategoryData = selectedCategory && categoryHasApiFilter;
  const categorySwr = useSWR(
    needsCategoryData
      ? (['collection', categoryPage, selectedCategory] as CollectionKey)
      : null,
    collectionFetcher,
    { revalidateOnFocus: false }
  );

  // "other" has no API-level filter (getCategorySearchTerm returns null).
  // Filter current page client-side and fetch additional pages to fill the grid.
  const [categoryObjects, setCategoryObjects] = useState<NormalizedObject[]>([]);
  const [categoryLoadingMore, setCategoryLoadingMore] = useState(false);

  useEffect(() => {
    if (selectedCategory !== 'other' || !baseSwr.data) {
      if (selectedCategory !== 'other') setCategoryObjects([]);
      return;
    }

    const filtered = baseSwr.data.objects.filter(o => o.category === 'other');
    setCategoryObjects(filtered);

    if (filtered.length >= ITEMS_PER_PAGE) return;

    let cancelled = false;
    let accumulated = [...filtered];
    let pagesFetched = 0;

    const fetchMore = async () => {
      setCategoryLoadingMore(true);
      for (
        let p = 1;
        p <= baseSwr.data!.totalPages &&
        pagesFetched < MAX_PAGES_TO_FETCH_FOR_CATEGORY;
        p++
      ) {
        if (cancelled || accumulated.length >= ITEMS_PER_PAGE) break;
        if (p === page) continue;
        pagesFetched++;
        try {
          const { objects } = await fetchCollectionPage(p, null);
          const fromPage = objects.filter(o => o.category === 'other');
          accumulated = [...accumulated, ...fromPage].slice(0, ITEMS_PER_PAGE);
          setCategoryObjects(accumulated);
        } catch {
          break;
        }
      }
      setCategoryLoadingMore(false);
    };

    fetchMore();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, baseSwr.data, page]);

  // Derived state
  const baseData = baseSwr.data;
  const categoryData = categorySwr.data;

  const displayedObjects =
    selectedCategory === null
      ? baseData?.objects ?? []
      : categoryHasApiFilter
        ? categoryData?.objects ?? []
        : categoryObjects;

  // Preserve last known totalPages during fetches so footer doesn't briefly show "page X of 1"
  const lastKnownTotalPagesRef = useRef(1);
  const resolvedTotalPages =
    selectedCategory === null
      ? baseData?.totalPages
      : categoryHasApiFilter
        ? categoryData?.totalPages
        : undefined;
  if (resolvedTotalPages != null) {
    lastKnownTotalPagesRef.current = resolvedTotalPages;
  }
  const totalPages =
    selectedCategory === null || categoryHasApiFilter
      ? (resolvedTotalPages ?? lastKnownTotalPagesRef.current)
      : 1;

  const currentPage =
    selectedCategory === null ? page : categoryHasApiFilter ? categoryPage : 1;

  const error = baseSwr.error ?? categorySwr.error;
  const isLoading =
    selectedCategory === null
      ? baseSwr.isLoading
      : categoryHasApiFilter
        ? categorySwr.isLoading
        : baseSwr.isLoading || categoryLoadingMore;

  const retry = selectedCategory === null ? baseSwr.mutate : categorySwr.mutate;

  const counts = computeCounts(displayedObjects);
  const yearRange = getYearRange(displayedObjects);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          type="button"
          onClick={() => retry()}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="shrink-0 px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          CHVisualizer
        </h1>
        <Legend
          counts={counts}
          continentCounts={computeContinentCounts(displayedObjects)}
          selectedCategory={selectedCategory}
          onCategoryClick={setSelectedCategory}
        />
      </header>

      <main className="flex-1 min-h-0 flex flex-col p-4">
        {displayedObjects.length === 0 && !isLoading ? (
          <p className="text-center text-gray-500 py-8">
            No objects found for this page
          </p>
        ) : (
          <CircleGrid
            objects={displayedObjects}
            isLoading={isLoading}
            returnPage={currentPage}
          />
        )}
      </main>

      <footer className="shrink-0 border-t border-gray-200 flex flex-col">
        {selectedCategory === null ? (
          <>
            <TimelineSlider yearRange={yearRange} />
            <PageNavigator
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : categoryHasApiFilter ? (
          <>
            <TimelineSlider yearRange={yearRange} />
            <PageNavigator
              currentPage={categoryPage}
              totalPages={totalPages}
              onPageChange={setCategoryPage}
            />
          </>
        ) : (
          <div className="px-6 py-3 flex flex-col gap-1">
            <div className="text-sm text-gray-500">
              Showing {displayedObjects.length}{' '}
              {displayedObjects.length === 1 ? 'object' : 'objects'} in{' '}
              {getCategoryLabel(selectedCategory)}
            </div>
            {categoryLoadingMore && (
              <div className="text-sm text-gray-500 flex items-center gap-2 animate-pulse">
                <span
                  className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                  aria-hidden
                />
                Fetching more {getCategoryLabel(selectedCategory).toLowerCase()}
                …
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

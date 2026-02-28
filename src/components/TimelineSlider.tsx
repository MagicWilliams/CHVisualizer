'use client';

interface TimelineSliderProps {
  yearRange?: string;
}

/** Collection spans ~30 centuries: ancient (1100 BC) to present */
const EARLIEST_YEAR = -1100;
const LATEST_YEAR = 2026;
const TIMELINE_SPAN = LATEST_YEAR - EARLIEST_YEAR;

/** Parse year range string (e.g. "1700–1800" or "1850") into min/max years */
function parseYearRange(
  yearRange: string | undefined
): { min: number; max: number } | null {
  if (!yearRange || !yearRange.trim()) return null;
  const str = yearRange.trim();
  const match = str.match(/^(-?\d+)\s*[–\-]\s*(-?\d+)$/);
  if (match) {
    const min = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    return { min, max };
  }
  const single = str.match(/^(-?\d+)$/);
  if (single) {
    const y = parseInt(single[1], 10);
    return { min: y, max: y };
  }
  return null;
}

/** Map a year to a percentage position on the timeline (0–100) */
function yearToPercent(year: number): number {
  const clamped = Math.max(EARLIEST_YEAR, Math.min(LATEST_YEAR, year));
  return ((clamped - EARLIEST_YEAR) / TIMELINE_SPAN) * 100;
}

/**
 * Visual timeline indicator showing where the current page's date range
 * falls in the context of history. Display-only, not interactive.
 */
export function TimelineSlider({ yearRange }: TimelineSliderProps) {
  const range = parseYearRange(yearRange);

  const leftPercent = range ? yearToPercent(range.min) : 0;
  const rightPercent = range ? yearToPercent(range.max) : 0;
  const segmentWidth = Math.max(2, rightPercent - leftPercent);

  return (
    <div className="w-full px-6 py-4 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-gray-500 tabular-nums shrink-0">
          {EARLIEST_YEAR < 0 ? `${EARLIEST_YEAR} BCE` : EARLIEST_YEAR}
        </span>
        <div className="flex-1 min-w-0 relative h-3 bg-gray-200 rounded-full overflow-visible">
          {/* Full timeline track */}
          <div className="absolute inset-0 rounded-full bg-gray-200" />
          {/* Highlighted segment: where this page's date range falls */}
          {range && (
            <div
              className="absolute top-0 bottom-0 rounded-full bg-gray-800 transition-all duration-300"
              style={{
                left: `${leftPercent}%`,
                width: `${segmentWidth}%`,
              }}
              title={`This page: ${yearRange}`}
            />
          )}
        </div>
        <span className="text-xs font-medium text-gray-500 tabular-nums shrink-0">
          {LATEST_YEAR}
        </span>
      </div>
      {yearRange && (
        <p className="text-center text-sm text-gray-600">
          This page: <span className="tabular-nums font-medium">{yearRange}</span>
        </p>
      )}
    </div>
  );
}

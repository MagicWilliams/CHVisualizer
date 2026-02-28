import type { VisualCategory, Continent } from "@/types/normalized";
import { CATEGORY_COLORS, getCategoryLabel } from "@/lib/categories";
import { CONTINENTS, getContinentLabel, getShapeForContinent } from "@/lib/continents";
import { ShapeSymbol } from "./ShapeSymbol";

const CONTINENT_LEGEND_COLOR = "#6b7280";

interface LegendProps {
  counts: Record<VisualCategory, number>;
  continentCounts: Record<Continent, number>;
  selectedCategory: VisualCategory | null;
  onCategoryClick: (category: VisualCategory | null) => void;
}

export function Legend({
  counts,
  continentCounts,
  selectedCategory,
  onCategoryClick,
}: LegendProps) {
  const entries = (Object.entries(counts) as [VisualCategory, number][]).filter(
    ([, count]) => count > 0
  );

  const continentEntries = CONTINENTS.filter(
    (c) => (continentCounts[c] ?? 0) > 0
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-medium text-gray-500 shrink-0">Categories:</span>
      {selectedCategory !== null && (
        <button
          type="button"
          onClick={() => onCategoryClick(null)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          All
        </button>
      )}
      {entries.map(([category, count]) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryClick(isSelected ? null : category)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              isSelected
                ? "ring-2 ring-offset-1 ring-gray-400 bg-gray-50 font-medium"
                : "hover:bg-gray-50"
            }`}
          >
            <div
              className="rounded-full shrink-0"
              style={{
                width: 10,
                height: 10,
                backgroundColor: CATEGORY_COLORS[category],
              }}
            />
            <span className="text-sm text-gray-700">
              {getCategoryLabel(category)} ({count})
            </span>
          </button>
        );
      })}
      </div>
      {continentEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-sm text-gray-700">
          <span className="font-medium text-gray-500 shrink-0">Continent:</span>
          {continentEntries.map((continent) => (
            <div
              key={continent}
              className="flex items-center gap-1.5"
              title={getContinentLabel(continent)}
            >
              <ShapeSymbol
                shape={getShapeForContinent(continent)}
                color={CONTINENT_LEGEND_COLOR}
                size={10}
                className="shrink-0"
              />
              <span>
                {getContinentLabel(continent)} ({continentCounts[continent]})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

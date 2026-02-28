/**
 * Cooper Hewitt API classification strings (from live API).
 * Used as the source of truth for categories.
 */
export const API_CLASSIFICATIONS: readonly string[] = [
  "albums (bound) & books",
  "animals",
  "appliances & tools",
  "architecture",
  "architecture, interiors",
  "archive",
  "ceramics",
  "containers",
  "costume & accessories",
  "cutlery",
  "digital",
  "embroidery & stitching",
  "enamels",
  "ephemera",
  "figures",
  "furniture",
  "glasswares",
  "graphic design",
  "hardware",
  "industrial design",
  "interiors",
  "jewelry",
  "knotted, knitted and crocheted textiles",
  "lace",
  "landscapes",
  "lighting",
  "metalwork",
  "miniatures",
  "models and prototypes",
  "mural designs",
  "music",
  "mythology",
  "nature studies",
  "non-woven textiles",
  "numismatics",
  "ornament",
  "packaging designs",
  "portraits",
  "printed, dyed & painted textiles",
  "sample books",
  "sculpture",
  "seascapes",
  "tableware designs",
  "textile designs",
  "theater",
  "tiles",
  "timepieces & measuring devices",
  "toys & games",
  "transportation",
  "trimmings",
  "woven textiles",
] as const;

export type ApiClassification = (typeof API_CLASSIFICATIONS)[number];

/** Convert classification string to URL-safe slug */
export function classificationToSlug(classification: string): string {
  return classification
    .toLowerCase()
    .replace(/[&,()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Build slug → classification lookup */
const SLUG_TO_CLASSIFICATION = new Map<string, string>();
for (const c of API_CLASSIFICATIONS) {
  SLUG_TO_CLASSIFICATION.set(classificationToSlug(c), c);
}

export function slugToClassification(slug: string): string | null {
  return SLUG_TO_CLASSIFICATION.get(slug) ?? null;
}

/** All valid category slugs (for API route validation) */
export const VALID_CATEGORY_SLUGS = [
  ...API_CLASSIFICATIONS.map(classificationToSlug),
  "other",
] as const;

export type VisualCategory = (typeof VALID_CATEGORY_SLUGS)[number];

/** Colors for categories – palette cycles for 50+ classifications */
const COLOR_PALETTE = [
  "#5B8DEF",
  "#E85D75",
  "#43AA8B",
  "#F9C74F",
  "#90708C",
  "#F3722C",
  "#4ECDC4",
  "#95A3B3",
  "#BC6C25",
  "#264653",
  "#E76F51",
  "#9B59B6",
  "#1ABC9C",
  "#E67E22",
  "#3498DB",
  "#2ECC71",
  "#E74C3C",
  "#8E44AD",
  "#16A085",
  "#D35400",
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h << 5) - h + slug.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export const CATEGORY_COLORS: Record<VisualCategory, string> = {} as Record<
  VisualCategory,
  string
>;
for (const slug of VALID_CATEGORY_SLUGS) {
  CATEGORY_COLORS[slug] =
    slug === "other"
      ? "#CCCCCC"
      : COLOR_PALETTE[hashSlug(slug) % COLOR_PALETTE.length];
}

/** Capitalize first letter of each word for display */
function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategoryLabel(category: VisualCategory): string {
  if (category === "other") return "Other";
  const label = slugToClassification(category) ?? category;
  return toTitleCase(label);
}

/**
 * Search term for Cooper Hewitt API `general` parameter.
 * Returns null for "other" (no API-level filter).
 */
export function getCategorySearchTerm(category: VisualCategory): string | null {
  if (category === "other") return null;
  const classification = slugToClassification(category);
  if (!classification) return null;
  // Use classification as search term; API does general text search
  return classification;
}

/** Map API classification to our category slug */
export function mapClassificationToCategory(
  classification: { summary?: { title?: string } }[] | null | undefined
): VisualCategory {
  const title = classification?.[0]?.summary?.title;
  if (!title || typeof title !== "string") return "other";

  const slug = classificationToSlug(title);
  return VALID_CATEGORY_SLUGS.includes(slug as VisualCategory)
    ? (slug as VisualCategory)
    : "other";
}

/** Department fallback when classification doesn't match */
export function mapDepartmentToCategory(
  department: string | null | undefined
): VisualCategory {
  if (!department || typeof department !== "string") return "other";

  const lower = department.toLowerCase().trim();
  if (lower.includes("drawings") && lower.includes("prints"))
    return "graphic-design";
  if (lower.includes("product design") || lower.includes("decorative arts"))
    return "furniture";
  if (lower.includes("textile")) return "woven-textiles";
  if (lower.includes("digital")) return "digital";

  return "other";
}

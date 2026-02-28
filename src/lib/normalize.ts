import type { RawObject } from "@/types/api";
import type { NormalizedObject } from "@/types/normalized";
import { parseDate } from "./date-parser";
import {
  mapClassificationToCategory,
  mapDepartmentToCategory,
  getCategoryLabel,
} from "./categories";
import { getContinent, getContinentLabel } from "./continents";

/** Sort objects by year ascending; undated items go last. */
export function sortObjectsByYear(
  objects: NormalizedObject[]
): NormalizedObject[] {
  return [...objects].sort((a, b) => {
    const ya = a.date.year ?? 9999;
    const yb = b.date.year ?? 9999;
    return ya - yb;
  });
}

function resolveDepartment(raw: RawObject): string | null {
  return Array.isArray(raw.department)
    ? raw.department[0]?.summary?.title ?? null
    : (raw.department as { title?: string } | null)?.title ?? null;
}

export function normalizeObject(raw: RawObject): NormalizedObject {
  const title = resolveTitle(raw);
  const dateRaw = Array.isArray(raw.date) ? raw.date[0] : raw.date;
  const date = parseDate(dateRaw);
  let category = mapClassificationToCategory(raw.classification);
  if (category === "other") {
    category = mapDepartmentToCategory(resolveDepartment(raw));
  }
  const categoryLabel = getCategoryLabel(category);
  const country = raw.geography?.country?.value ?? null;
  const continent = getContinent(country);
  const continentLabel = getContinentLabel(continent);

  return {
    id: raw.id,
    title,
    objectName: Array.isArray(raw.name) ? raw.name[0]?.value ?? null : raw.name?.title ?? null,
    date,
    category,
    categoryLabel,
    department: resolveDepartment(raw),
    classification: raw.classification?.[0]?.summary?.title ?? null,
    description: resolveDescription(raw.description),
    makers: (raw.maker ?? []).map((m) => m.summary?.title ?? "").filter(Boolean),
    materials: (raw.medium ?? []).map((m) => m.value ?? "").filter(Boolean),
    dimensions: resolveDimensions(raw.measurements),
    origin: resolveOrigin(raw.geography),
    continent,
    continentLabel,
    imagePreviewUrl: resolveImageUrl(raw.multimedia, "preview"),
    imageLargeUrl: resolveImageUrl(raw.multimedia, "large"),
    isCC0: (raw.multimedia ?? []).some((m) => m.cc0 === true),
    creditLine: raw.legal?.credit_line ?? raw.legal?.credit ?? null,
    accessionNumber: resolveAccessionNumber(raw.identifier),
  };
}

function resolveTitle(raw: RawObject): string {
  const titles = raw.title;
  if (Array.isArray(titles) && titles.length > 0) {
    const descriptive = titles.find((t) => t.type === "Descriptive title");
    if (descriptive?.value) return descriptive.value;
    if (titles[0]?.value) return titles[0].value;
  }
  if (raw.summary?.title) return raw.summary.title;
  return "Untitled";
}

function resolveDescription(
  descriptions: { type?: string; value?: string }[] | null | undefined
): string | null {
  const arr = descriptions ?? [];
  if (arr.length === 0) return null;
  const general = arr.find((d) =>
    String(d.type ?? "").toLowerCase().includes("general description")
  );
  if (general?.value) return general.value;
  const digital = arr.find((d) =>
    String(d.type ?? "").toLowerCase().includes("digital table text")
  );
  if (digital?.value) return digital.value;
  if (arr[0]?.value) return arr[0].value;
  return null;
}

function resolveImageUrl(
  multimedia: RawObject["multimedia"],
  size: "preview" | "large"
): string | null {
  const arr = multimedia ?? [];
  const entry = arr.find(
    (m) => m.type === "image" || m.datatype?.actual === "image"
  );
  if (!entry) return null;
  if (size === "large") {
    return entry.large?.url ?? entry.original?.url ?? entry.preview?.url ?? null;
  }
  return entry.preview?.url ?? entry.large?.url ?? entry.original?.url ?? null;
}

function resolveDimensions(measurements: unknown): string | null {
  if (!measurements || typeof measurements !== "object") return null;
  const m = measurements as { dimensions?: { value?: string }[] };
  const dims = m.dimensions;
  if (Array.isArray(dims) && dims.length > 0) {
    return dims[0]?.value ?? null;
  }
  return null;
}

function resolveOrigin(
  geography: RawObject["geography"]
): string | null {
  if (!geography) return null;
  const country = geography.country?.value;
  const city = geography.city?.value;
  const name = geography.name;
  if (!country && !city && !name) return null;
  if (city && country) return `${city}, ${country}`;
  return country ?? city ?? name ?? null;
}

function resolveAccessionNumber(
  identifiers: RawObject["identifier"]
): string | null {
  const arr = identifiers ?? [];
  const acc = arr.find((i) => i.type === "accession number");
  return acc?.value ?? null;
}

/** Debug: log classification data to help improve category mapping. Run in dev only. */
function logClassificationDebug(rawObjects: RawObject[]): void {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;

  const otherClassifications = new Map<string, number>();
  const allTitles = new Set<string>();
  const sampleRaw: Array<{ id: string; classification: unknown; department: unknown }> = [];

  for (const raw of rawObjects) {
    const classification = raw.classification;
    const title = classification?.[0]?.summary?.title;
    if (title != null && typeof title === "string") {
      allTitles.add(title);
    }

    let category = mapClassificationToCategory(raw.classification);
    if (category === "other") {
      category = mapDepartmentToCategory(resolveDepartment(raw));
    }
    if (category === "other") {
      const key = title ?? "(null/undefined)";
      otherClassifications.set(key, (otherClassifications.get(key) ?? 0) + 1);
      if (sampleRaw.length < 10) {
        sampleRaw.push({
          id: raw.id,
          classification: raw.classification,
          department: raw.department,
        });
      }
    }
  }

  console.group("[CHVisualizer] Classification debug");
  console.log("All unique classification titles on this page:", [...allTitles].sort());
  console.log(
    "Classification values that mapped to 'other' (count):",
    Object.fromEntries([...otherClassifications.entries()].sort((a, b) => b[1] - a[1]))
  );
  console.log("Sample raw objects that mapped to 'other':", sampleRaw);
  console.groupEnd();
}

export function normalizeObjects(rawObjects: RawObject[]): NormalizedObject[] {
  const result: NormalizedObject[] = [];
  for (const raw of rawObjects) {
    try {
      result.push(normalizeObject(raw));
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to normalize object ${raw.id}:`, err);
      }
    }
  }
  logClassificationDebug(rawObjects);
  return result;
}

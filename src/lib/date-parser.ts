import type { ParsedDate } from "@/types/normalized";

/**
 * Robust date string parser for museum dates.
 * Handles: simple years, ca./circa, ranges (1880-1890, 1880–90), centuries, decades, n.d.
 */
export function parseDate(
  rawDate: { from?: string | null; to?: string | null; value?: string | null } | null | undefined
): ParsedDate {
  const raw = rawDate?.value ?? rawDate?.from ?? rawDate?.to ?? "";
  const str = (typeof raw === "string" ? raw : "").trim();

  if (!str || /^n\.?d\.?$/i.test(str) || str === "null" || str === "undefined") {
    return {
      year: null,
      yearStart: null,
      yearEnd: null,
      isApproximate: false,
      raw: str || "n.d.",
    };
  }

  const isApproximate = /\b(ca\.?|c\.?|circa|about|approx\.?)\b/i.test(str);
  const cleanStr = str.replace(/\b(ca\.?|c\.?|circa|about|approx\.?)\b\.?\s*/gi, "").trim();

  // Try from/to first
  const fromYear = parseYear(rawDate?.from);
  const toYear = parseYear(rawDate?.to);
  if (fromYear !== null || toYear !== null) {
    return {
      year: fromYear ?? toYear ?? null,
      yearStart: fromYear ?? toYear ?? null,
      yearEnd: toYear ?? fromYear ?? null,
      isApproximate,
      raw: str,
    };
  }

  // Century: "19th century" -> 1850, 1800-1899
  const centuryMatch = cleanStr.match(/(\d{1,2})(?:st|nd|rd|th)\s+century/i);
  if (centuryMatch) {
    const c = parseInt(centuryMatch[1], 10);
    const start = (c - 1) * 100;
    const end = c * 100 - 1;
    return {
      year: start + Math.floor((end - start) / 2),
      yearStart: start,
      yearEnd: end,
      isApproximate: true,
      raw: str,
    };
  }

  // Decade: "1920s" -> 1925, 1920-1929
  const decadeMatch = cleanStr.match(/^(\d{3})0s$/i);
  if (decadeMatch) {
    const dec = parseInt(decadeMatch[1], 10);
    const start = dec * 10;
    const end = start + 9;
    return {
      year: start + 4,
      yearStart: start,
      yearEnd: end,
      isApproximate: true,
      raw: str,
    };
  }

  // Range: "1880-1890" or "1880–90" or "1880-90"
  const rangeMatch = cleanStr.match(/^(\d{4})\s*[–\-]\s*(\d{2,4})\s*$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    let endStr = rangeMatch[2];
    if (endStr.length === 2) {
      endStr = rangeMatch[1].slice(0, 2) + endStr;
    }
    const end = parseInt(endStr, 10);
    return {
      year: start,
      yearStart: start,
      yearEnd: end,
      isApproximate,
      raw: str,
    };
  }

  // Single 4-digit year
  const yearMatch = cleanStr.match(/\b(\d{4})\b/);
  if (yearMatch) {
    const y = parseInt(yearMatch[1], 10);
    return {
      year: y,
      yearStart: y,
      yearEnd: y,
      isApproximate,
      raw: str,
    };
  }

  return {
    year: null,
    yearStart: null,
    yearEnd: null,
    isApproximate: false,
    raw: str,
  };
}

function parseYear(val: string | null | undefined): number | null {
  if (!val || typeof val !== "string") return null;
  const m = val.match(/\b(\d{4})\b/);
  return m ? parseInt(m[1], 10) : null;
}

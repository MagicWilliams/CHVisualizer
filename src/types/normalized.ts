// Normalized internal model types — consumed only by presentation layer

import type { VisualCategory } from "@/lib/categories";
import type { Continent } from "@/lib/continents";

export type { VisualCategory, Continent };

export interface ParsedDate {
  year: number | null;
  yearStart: number | null;
  yearEnd: number | null;
  isApproximate: boolean;
  raw: string;
}

export interface NormalizedObject {
  id: string;
  title: string;
  objectName: string | null;
  date: ParsedDate;
  category: VisualCategory;
  categoryLabel: string;
  department: string | null;
  classification: string | null;
  description: string | null;
  makers: string[];
  materials: string[];
  dimensions: string | null;
  origin: string | null;
  continent: Continent;
  continentLabel: string;
  imagePreviewUrl: string | null;
  imageLargeUrl: string | null;
  isCC0: boolean;
  creditLine: string | null;
  accessionNumber: string | null;
}

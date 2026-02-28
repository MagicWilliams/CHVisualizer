// Raw Cooper Hewitt API response types

import type { NormalizedObject } from "@/types/normalized";

export interface RawTypedValue {
  type?: string;
  value?: string;
}

export interface RawSummary {
  title?: string;
}

export interface RawDate {
  from?: string | null;
  to?: string | null;
  value?: string | null;
}

export interface RawClassification {
  id?: string;
  summary?: RawSummary;
}

export interface RawMaker {
  summary?: RawSummary;
}

export interface RawMedium {
  value?: string;
}

export interface RawMultimediaMeasurement {
  value?: string;
  type?: string;
}

export interface RawMultimediaSize {
  width?: number;
  height?: number;
}

export interface RawMultimedia {
  type?: string;
  preview?: { url?: string };
  large?: { url?: string };
  original?: { url?: string };
  cc0?: boolean;
  datatype?: { actual?: string };
  measurement?: RawMultimediaMeasurement[];
  size?: RawMultimediaSize;
}

export interface RawGeography {
  country?: { value?: string };
  city?: { value?: string };
  name?: string;
}

export interface RawIdentifier {
  type?: string;
  value?: string;
}

export interface RawDescription {
  type?: string;
  value?: string;
}

export interface RawLegal {
  credit_line?: string;
  credit?: string;
}

export interface RawMeasurements {
  dimensions?: { value?: string }[];
}

export interface RawObject {
  id: string;
  title?: RawTypedValue[] | null;
  summary?: RawSummary;
  identifier?: RawIdentifier[] | null;
  classification?: RawClassification[] | null;
  date?: RawDate | RawDate[] | null;
  department?: RawSummary | RawClassification[] | null;
  description?: RawDescription[] | null;
  geography?: RawGeography | null;
  legal?: RawLegal | null;
  measurements?: RawMeasurements | null;
  medium?: RawMedium[] | null;
  multimedia?: RawMultimedia[] | null;
  name?: RawSummary | { value?: string }[] | null;
  maker?: RawMaker[] | null;
  note?: unknown;
  period?: unknown;
  provenance?: unknown;
  status?: unknown;
}

export interface ExtensionsPagination {
  hits?: number;
  per_page?: number;
  current_page?: number;
  number_of_pages?: number;
}

export interface RawCollectionResponse {
  object?: RawObject[];
  extensions?: {
    pagination?: ExtensionsPagination;
  };
}

export interface RawObjectResponse {
  object?: RawObject | null;
}

/** Normalized API response from /api/collection */
export interface CollectionApiResponse {
  objects: NormalizedObject[];
  extensions?: { pagination?: ExtensionsPagination };
}

/** Normalized API response from /api/object/[id] */
export interface ObjectApiResponse {
  object: NormalizedObject;
}

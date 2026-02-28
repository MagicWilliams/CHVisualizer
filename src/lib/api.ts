import { GraphQLClient, gql } from "graphql-request";
import type {
  RawCollectionResponse,
  RawObjectResponse,
  RawObject,
  ExtensionsPagination,
} from "@/types/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";

const API_URL = "https://api.cooperhewitt.org/";
const client = new GraphQLClient(API_URL);

/** Shared object fields for collection and single-object queries. */
const OBJECT_FIELDS = `
  id
  title
  summary
  identifier
  classification
  date
  department
  description
  geography
  legal
  measurements
  medium
  multimedia
  name
  maker { summary }
  note
  period
  provenance
  status
`;

const COLLECTION_QUERY = gql`
  query GetCollection($page: Int!, $size: Int!, $general: String, $sort: [GenericScalar]) {
    object(size: $size, page: $page, general: $general, sort: $sort) {
      ${OBJECT_FIELDS}
    }
  }
`;

const OBJECT_QUERY = gql`
  query GetObject($id: ID!) {
    object(id: $id) {
      ${OBJECT_FIELDS}
    }
  }
`;

export interface CollectionPageResult {
  objects: RawObject[];
  pagination: ExtensionsPagination | null;
}

/** Cooper Hewitt API uses 0-based page numbers; our app uses 1-based. */
export async function fetchCollectionPage(
  pageOneBased: number,
  searchTerm?: string | null
): Promise<CollectionPageResult> {
  const pageZeroBased = Math.max(0, pageOneBased - 1);
  const variables: {
    page: number;
    size: number;
    general?: string;
    sort: { creationYear: string }[];
  } = {
    page: pageZeroBased,
    size: ITEMS_PER_PAGE,
    sort: [{ creationYear: "asc" }],
  };
  if (searchTerm && searchTerm.trim()) {
    variables.general = searchTerm.trim();
  }

  const { data, extensions } = await client.rawRequest<{
    object: RawCollectionResponse["object"];
  }>(COLLECTION_QUERY, variables);

  const pagination = (extensions as { pagination?: ExtensionsPagination })
    ?.pagination ?? null;

  return {
    objects: data?.object ?? [],
    pagination,
  };
}

export async function fetchObjectById(
  id: string
): Promise<RawObjectResponse | null> {
  const { data } = await client.rawRequest<{
    object: RawObject | RawObject[] | null;
  }>(OBJECT_QUERY, { id });
  const raw = data?.object;
  // Single-object query returns an array; extract first element
  const object = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
  return object ? { object } : null;
}

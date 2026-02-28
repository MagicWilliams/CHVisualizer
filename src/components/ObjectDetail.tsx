import Link from "next/link";
import type { NormalizedObject } from "@/types/normalized";
import { CATEGORY_COLORS } from "@/lib/categories";

interface ObjectDetailProps {
  object: NormalizedObject;
  returnPage?: number;
}

export function ObjectDetail({ object, returnPage }: ObjectDetailProps) {
  const backHref = returnPage ? `/?page=${returnPage}` : "/";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href={backHref}
        className="inline-block mb-6 text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to collection
      </Link>

      <div className="space-y-6">
        {object.imageLargeUrl ? (
          <img
            src={object.imageLargeUrl}
            alt={object.title}
            className="w-full max-h-96 object-contain bg-gray-100 rounded"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}

        <h1 className="text-2xl font-semibold">{object.title}</h1>

        <div className="flex items-center gap-2">
          <div
            className="rounded-full shrink-0"
            style={{
              width: 14,
              height: 14,
              backgroundColor: CATEGORY_COLORS[object.category],
            }}
          />
          <span className="text-sm text-gray-700">{object.categoryLabel}</span>
        </div>

        <dl className="grid gap-2 text-sm">
          <MetaRow label="Date" value={object.date.raw || "undated"} />
          {object.date.isApproximate && (
            <MetaRow label="" value="(approximate)" />
          )}
          <MetaRow label="Department" value={object.department} />
          <MetaRow label="Classification" value={object.classification} />
          <MetaRow label="Object type" value={object.objectName} />
          {object.makers.length > 0 && (
            <MetaRow label="Makers" value={object.makers.join(", ")} />
          )}
          {object.materials.length > 0 && (
            <MetaRow label="Materials" value={object.materials.join(", ")} />
          )}
          <MetaRow label="Dimensions" value={object.dimensions} />
          <MetaRow label="Origin" value={object.origin} />
          <MetaRow label="Credit" value={object.creditLine} />
          <MetaRow label="Accession" value={object.accessionNumber} />
        </dl>

        {object.description && (
          <p className="text-black leading-relaxed">{object.description}</p>
        )}

        {object.isCC0 && (
          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
            CC0
          </span>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-2">
      {label && <dt className="font-medium text-gray-600 w-28">{label}:</dt>}
      <dd className={label ? "" : "ml-28"}>{value}</dd>
    </div>
  );
}

import { notFound } from "next/navigation";
import { ObjectDetail } from "@/components/ObjectDetail";
import { fetchObjectById } from "@/lib/api";
import { normalizeObject } from "@/lib/normalize";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ObjectPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page } = await searchParams;
  const returnPage = page ? parseInt(page, 10) : undefined;

  const result = await fetchObjectById(id);

  if (!result?.object) notFound();

  const object = normalizeObject(result.object);

  return (
    <div className="min-h-screen bg-white">
      <ObjectDetail object={object} returnPage={returnPage} />
    </div>
  );
}

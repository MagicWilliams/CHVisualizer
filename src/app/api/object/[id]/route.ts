import { NextRequest, NextResponse } from "next/server";
import { fetchObjectById } from "@/lib/api";
import { normalizeObject } from "@/lib/normalize";
import { getErrorMessage } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing object ID" }, { status: 400 });
  }

  try {
    const result = await fetchObjectById(id);

    if (!result?.object) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    const object = normalizeObject(result.object);
    return NextResponse.json({ object });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json(
      { error: message || "Failed to fetch object" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { deleteVideo, getVideoById } from "@/lib/videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) {
    return NextResponse.json({ error: "未找到该视频" }, { status: 404 });
  }
  return NextResponse.json({ video });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const ok = deleteVideo(id);
  if (!ok) {
    return NextResponse.json({ error: "未找到该视频" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id: Number(id) });
}

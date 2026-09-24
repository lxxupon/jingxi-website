import { NextResponse } from "next/server";
import { listVideos, createVideo } from "@/lib/videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ videos: listVideos() });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  if (!body.title || !body.video_url) {
    return NextResponse.json(
      { error: "title 与 video_url 为必填项" },
      { status: 400 }
    );
  }

  const video = createVideo({
    title: body.title,
    description: body.description ?? null,
    category: body.category ?? null,
    duration: body.duration ?? null,
    cover: body.cover ?? null,
    video_url: body.video_url,
  });

  return NextResponse.json({ video }, { status: 201 });
}

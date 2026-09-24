"use client";

import { useEffect, useMemo, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { getProgress } from "@/lib/progress";

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "fav", label: "收藏" },
  { id: "done", label: "已完成" },
  { id: "todo", label: "还没做" },
];

export default function VideoLibrary({ videos }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("全部");
  const [filter, setFilter] = useState("all");
  const [progress, setProgress] = useState(null);

  useEffect(() => setProgress(getProgress()), []);

  const categories = useMemo(() => {
    const set = new Set(videos.map((v) => v.category).filter(Boolean));
    return ["全部", ...Array.from(set)];
  }, [videos]);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return videos.filter((v) => {
      if (cat !== "全部" && v.category !== cat) return false;
      if (kw) {
        const hay = `${v.title} ${v.description || ""} ${v.category || ""}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (progress) {
        const key = String(v.id);
        if (filter === "fav" && !progress.favs.includes(key)) return false;
        if (filter === "done" && !progress.done.includes(key)) return false;
        if (filter === "todo" && progress.done.includes(key)) return false;
      }
      return true;
    });
  }, [cat, filter, progress, q, videos]);

  const doneCount = progress
    ? videos.filter((v) => progress.done.includes(String(v.id))).length
    : 0;

  return (
    <>
      <div className="lib-toolbar">
        <div className="lt-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索标题或关键词…"
            aria-label="搜索"
          />
          {q && (
            <button className="lt-clear" onClick={() => setQ("")} aria-label="清除">
              ×
            </button>
          )}
        </div>
        <div className="chip-row">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip ${filter === f.id ? "on" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip subtle ${cat === c ? "on" : ""}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="lib-count">
        共 {list.length} 条
        {progress ? ` · 已完成 ${doneCount} / ${videos.length}` : ""}
        {list.length === 0 && " · 换个条件试试"}
      </p>

      <div className="video-grid">
        {list.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </>
  );
}

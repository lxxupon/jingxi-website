"use client";

import { useEffect, useState } from "react";
import { getProgress, markDone, toggleFav, unmarkDone } from "@/lib/progress";

export default function VideoActions({ id }) {
  const [state, setState] = useState(null);

  useEffect(() => setState(getProgress()), [id]);

  if (!state) return null;
  const key = String(id);
  const done = state.done.includes(key);
  const fav = state.favs.includes(key);

  return (
    <div className="detail-actions">
      <button
        className={`chip ${done ? "on" : ""}`}
        onClick={() => {
          const p = done ? unmarkDone(id) : markDone(id);
          setState(p);
        }}
      >
        {done ? "已完成 ✓" : "标记为已完成"}
      </button>
      <button
        className={`chip ${fav ? "on" : ""}`}
        onClick={() => setState(toggleFav(id))}
      >
        {fav ? "已收藏 ★" : "收藏 ☆"}
      </button>
    </div>
  );
}

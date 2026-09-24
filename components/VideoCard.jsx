"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProgress, toggleFav } from "@/lib/progress";

export default function VideoCard({ video }) {
  const [fav, setFav] = useState(false);
  const [done, setDone] = useState(false);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const p = getProgress();
    setFav(p.favs.includes(String(video.id)));
    setDone(p.done.includes(String(video.id)));
    setPos(p.positions[String(video.id)] || 0);
  }, [video.id]);

  const onFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const p = toggleFav(video.id);
    setFav(p.favs.includes(String(video.id)));
  };

  const minutes = video.minutes || null;
  const percent =
    minutes && pos ? Math.min(100, Math.round((pos / (minutes * 60)) * 100)) : 0;

  return (
    <article className={`video-card ${done ? "is-done" : ""}`}>
      <Link href={`/videos/${video.id}`} className="vc-link">
        <div className="video-card-thumb">
          <img
            src={video.cover || "/assets/photos/p1.jpg"}
            alt={video.title}
            loading="lazy"
          />
          {done && <span className="vc-done-badge">已完成</span>}
          {!done && percent > 0 && (
            <span className="vc-resume">看到 {percent}%</span>
          )}
        </div>
        <div className="video-card-body">
          <span className="video-card-cat">{video.category || "引导"}</span>
          <span className="video-card-title">{video.title}</span>
          <span className="video-card-desc">{video.description}</span>
        </div>
      </Link>
      <div className="video-card-meta">
        <span>{video.category || "引导"}</span>
        <span className="vc-meta-right">
          <span>{video.duration || ""}</span>
          <button
            className={`vc-fav ${fav ? "on" : ""}`}
            onClick={onFav}
            aria-pressed={fav}
            aria-label={fav ? "取消收藏" : "收藏"}
            title={fav ? "取消收藏" : "收藏"}
          >
            {fav ? "★" : "☆"}
          </button>
        </span>
      </div>
    </article>
  );
}

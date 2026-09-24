"use client";

import { useCallback, useEffect, useState } from "react";
import { PHOTOS, PHOTO_CREDIT } from "@/lib/photos";

export default function GallerySection() {
  const [openAt, setOpenAt] = useState(-1);
  const [paused, setPaused] = useState(false);

  const close = useCallback(() => setOpenAt(-1), []);
  const step = useCallback((delta) => {
    setOpenAt((i) => (i + delta + PHOTOS.length) % PHOTOS.length);
  }, []);

  useEffect(() => {
    if (openAt < 0) return;
    function onKey(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === " ") {
        e.preventDefault();
        setPaused((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close, openAt, step]);

  // 停留模式：每张图自动停留 20 秒后翻到下一张
  useEffect(() => {
    if (openAt < 0 || paused) return;
    const t = setTimeout(() => step(1), 20000);
    return () => clearTimeout(t);
  }, [openAt, paused, step]);

  const cur = openAt >= 0 ? PHOTOS[openAt] : null;

  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <div className="gallery-header">
          <div className="gallery-header-left">
            <p className="gallery-kicker">自然意境</p>
            <h2 className="gallery-title">看一片风景，停一会儿</h2>
          </div>
          <button className="gallery-hint as-button" onClick={() => setOpenAt(0)}>
            逐张停留 →
          </button>
        </div>

        <div className="gallery-grid">
          {PHOTOS.slice(0, 6).map((p, i) => (
            <button
              key={p.src}
              className={`gallery-cell ${i === 0 ? "cell-lg" : ""}`}
              onClick={() => setOpenAt(i)}
            >
              <img src={p.src} alt={p.title} loading="lazy" />
              <span className="cell-caption">
                <span className="cell-title">{p.title}</span>
                <span className="cell-mood">{p.mood}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="gallery-foot">
          <span>
            共 {PHOTOS.length} 张 · 点击任意一张可全屏停留
          </span>
          <a
            href={PHOTO_CREDIT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="credit"
          >
            图片来源 {PHOTO_CREDIT.source} · {PHOTO_CREDIT.license}
          </a>
        </div>
      </div>

      {cur && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
            <img src={cur.src} alt={cur.title} className="lb-img" />

            <div className="lb-info">
              <div className="lb-head">
                <span className="lb-title">{cur.title}</span>
                <span className="lb-tag">{cur.tag}</span>
              </div>
              <p className="lb-mood">{cur.mood}</p>
              <p className="lb-invite">{cur.invite}</p>
              <div className="lb-bar">
                <span
                  className="lb-progress"
                  key={openAt + (paused ? "p" : "r")}
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                />
              </div>
            </div>

            <button className="lb-nav prev" onClick={() => step(-1)} aria-label="上一张">
              ‹
            </button>
            <button className="lb-nav next" onClick={() => step(1)} aria-label="下一张">
              ›
            </button>
            <button className="lb-close" onClick={close} aria-label="关闭">
              ×
            </button>
            <button
              className="lb-pause"
              onClick={() => setPaused((v) => !v)}
              aria-label="暂停自动播放"
            >
              {paused ? "继续自动翻页" : "暂停自动翻页"}
            </button>

            <div className="lb-count">
              {openAt + 1} / {PHOTOS.length}
            </div>
            <div className="lb-thumbs">
              {PHOTOS.map((p, i) => (
                <button
                  key={p.src}
                  className={`lb-thumb ${i === openAt ? "on" : ""}`}
                  onClick={() => setOpenAt(i)}
                  aria-label={p.title}
                >
                  <img src={p.src} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

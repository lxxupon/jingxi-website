"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { summarize } from "@/lib/stats";

export default function Footer() {
  const [stats, setStats] = useState(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    setStats(summarize());
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <footer className="site-footer" id="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-left">
            <div className="footer-brand">
              <span className="footer-dot" />
              <span className="footer-brand-name">静息</span>
            </div>
            <p className="footer-tagline">愿你在此刻找到平静</p>
            {stats && stats.totalSeconds > 0 && (
              <p className="footer-stat">
                已累计安静 {Math.round(stats.totalSeconds / 60)} 分钟 · 连续{" "}
                {stats.streak} 天
              </p>
            )}
          </div>
          <nav className="footer-nav">
            <Link href="/#breath">呼吸练习</Link>
            <Link href="/#ambient">环境音</Link>
            <Link href="/videos">引导练习</Link>
            <Link href="/#gallery">自然意境</Link>
            <Link href="/#quote">每日一句</Link>
            <Link href="/studio">网站设计</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span className="footer-copyright">
            2026 静息. 在喧嚣中，留一处安静。
          </span>
          <span className="footer-made-with">
            素材来自 Unsplash 与 Wikimedia Commons
          </span>
        </div>
      </div>

      <button
        className={`to-top ${showTop ? "on" : ""}`}
        onClick={toTop}
        aria-label="回到顶部"
      >
        ↑
      </button>
    </footer>
  );
}

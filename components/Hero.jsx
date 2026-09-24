"use client";

import { useCallback, useEffect, useState } from "react";
import { summarize } from "@/lib/stats";

const GREETINGS = [
  { until: 5, text: "夜深了", note: "如果还醒着，就慢一点呼吸" },
  { until: 11, text: "早上好", note: "先安顿好自己，再开始这一天" },
  { until: 14, text: "中午好", note: "停一下，比撑着有用" },
  { until: 18, text: "下午好", note: "给自己留三分钟" },
  { until: 23, text: "晚上好", note: "把今天轻轻放下" },
];

export default function Hero() {
  const [greet] = useState(() => {
    const h = new Date().getHours();
    return GREETINGS.find((x) => h <= x.until) || GREETINGS[GREETINGS.length - 1];
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(summarize());
  }, []);

  const startBreath = useCallback(() => {
    const el = document.getElementById("breath");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("jingxi:breath-start"));
  }, []);

  const goto = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-left">
          <div className="hero-glow" />
          <p className="hero-kicker">
            — 数字栖息地{greet ? ` · ${greet.text}` : ""}
          </p>
          <h1 className="hero-headline">在喧嚣深处</h1>
          <h1 className="hero-headline">找到你的静息时刻</h1>
          <p className="hero-subtitle">
            这里没有待办事项，没有通知提醒。只有你，和此刻的呼吸。
            {greet ? greet.note : ""}。
          </p>
          <div className="cta-wrap">
            <button className="cta-button" onClick={startBreath}>
              <span className="cta-icon" aria-hidden>
                ◍
              </span>
              <span className="cta-text">开始一次呼吸</span>
            </button>
            <button className="cta-button ghost" onClick={() => goto("ambient")}>
              <span className="cta-text">听点环境音</span>
            </button>
            <span className="cta-hint">3 分钟起</span>
          </div>
          {stats && stats.totalSeconds > 0 && (
            <p className="hero-stats">
              你已经在这里安静过 {Math.round(stats.totalSeconds / 60)} 分钟
              {stats.streak > 1 ? ` · 连续 ${stats.streak} 天` : ""}
            </p>
          )}
        </div>
        <div className="hero-image">
          <img src="/assets/photos/p1.jpg" alt="林间晨光" />
          <span className="hero-image-cap">林间晨光 · 来自 Unsplash</span>
        </div>
      </div>
    </section>
  );
}

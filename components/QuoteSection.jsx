"use client";

import { useCallback, useEffect, useState } from "react";
import { QUOTES, dailyQuote, randomQuote, dateKey } from "@/lib/quotes";

export default function QuoteSection() {
  const [quote, setQuote] = useState(() => dailyQuote());
  const [copied, setCopied] = useState(false);
  const [today] = useState(() => dateKey());

  const shuffle = useCallback(() => {
    setQuote((q) => randomQuote(q?.text));
    setCopied(false);
  }, []);

  const backToToday = useCallback(() => {
    setQuote(dailyQuote());
    setCopied(false);
  }, []);

  const copy = useCallback(async () => {
    if (!quote) return;
    const text = `「${quote.text}」\n—— ${quote.author} ${quote.source}\n（来自 静息 · 每日一句）`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [quote]);

  const startBreath = useCallback(() => {
    const el = document.getElementById("breath");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("jingxi:breath-start"));
  }, []);

  const todays = dailyQuote();
  const isToday = quote.text === todays.text;

  return (
    <section className="quote" id="quote">
      <div className="quote-decor">
        <span className="qd-ring" />
      </div>

      <p className="quote-date">{today} · 每日一句</p>
      <h2 className="quote-text">{quote.text}</h2>
      <p className="quote-attribution">
        —— {quote.author} · {quote.source}
      </p>
      {quote.note && <p className="quote-note">{quote.note}</p>}

      <div className="quote-actions">
        <button className="quote-btn" onClick={shuffle}>
          换一句
        </button>
        <button className="quote-btn" onClick={copy}>
          {copied ? "已复制 ✓" : "复制这句话"}
        </button>
        {!isToday && (
          <button className="quote-btn ghost" onClick={backToToday}>
            回到今日
          </button>
        )}
      </div>

      <div className="quote-cta">
        <button className="quote-cta-button" onClick={startBreath}>
          <span className="quote-cta-text">当你准备好了，开始吧</span>
          <span className="quote-arrow">→</span>
        </button>
        <span className="quote-count">
          共收录 {QUOTES.length} 句 · 每天自动换一句
        </span>
      </div>
    </section>
  );
}

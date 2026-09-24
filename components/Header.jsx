"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "首页", exact: true },
  { href: "/#breath", label: "呼吸练习", hash: "breath" },
  { href: "/#ambient", label: "环境音", hash: "ambient" },
  { href: "/#gallery", label: "自然意境", hash: "gallery" },
  { href: "/videos", label: "引导练习" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 首页滚动时高亮对应区块
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }
    const ids = ["breath", "ambient", "gallery", "quote"];
    const onScroll = () => {
      const line = window.scrollY + window.innerHeight * 0.35;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= line) current = id;
      }
      setActiveHash(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const isActive = (item) => {
    if (item.exact) return pathname === "/" && !activeHash;
    if (item.hash) return pathname === "/" && activeHash === item.hash;
    return pathname.startsWith(item.href);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          <span className="brand-name">静息</span>
        </Link>

        <nav className={`nav ${open ? "open" : ""}`}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item) ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/studio" className="nav-cta" onClick={() => setOpen(false)}>
            网站设计
          </Link>
        </nav>

        <button
          className={`nav-toggle ${open ? "on" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="打开导航"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

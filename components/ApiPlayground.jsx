"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE = {
  title: "接口测试 · 一条临时记录",
  description: "由「网站设计」页面的调试面板创建，可一键删除。",
  category: "调试",
  duration: "1 min",
  cover: "/assets/photos/p5.jpg",
  video_url: "/assets/media/clouds.webm",
  minutes: 1,
  tips: ["这条记录是用来验证 POST / DELETE 接口的。"],
};

export default function ApiPlayground({ initialVideos = [] }) {
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState("");
  const [staticMode, setStaticMode] = useState(false);
  const createdRef = useRef(null);

  // 静态部署下没有后端接口，先探一次；探不到就改用构建时的数据快照
  useEffect(() => {
    let alive = true;
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (!alive) return;
        if (!d?.videos) {
          setStaticMode(true);
          setLogs([
            {
              t: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
              method: "GET",
              url: "静态快照",
              status: "200",
              body: {
                条数: initialVideos.length,
                第一条: initialVideos[0]?.title ?? null,
                说明: "当前是静态部署，数据来自构建时的数据库快照",
              },
            },
          ]);
        }
      })
      .catch(() => alive && setStaticMode(true));
    return () => {
      alive = false;
    };
  }, [initialVideos]);

  const push = useCallback((entry) => {
    setLogs((prev) =>
      [
        {
          t: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
          ...entry,
        },
        ...prev,
      ].slice(0, 8)
    );
  }, []);

  const runGet = useCallback(async () => {
    if (staticMode) {
      push({
        method: "GET",
        url: "静态快照",
        status: "200",
        body: {
          条数: initialVideos.length,
          第一条: initialVideos[0]?.title ?? null,
          说明: "当前是静态部署，读取的是构建时的数据库快照",
        },
      });
      return;
    }
    setBusy("get");
    try {
      const res = await fetch("/api/videos", { cache: "no-store" });
      const data = await res.json();
      push({
        method: "GET",
        url: "/api/videos",
        status: res.status,
        body: {
          条数: data.videos?.length ?? 0,
          第一条: data.videos?.[0]?.title ?? null,
        },
      });
    } catch (e) {
      push({ method: "GET", url: "/api/videos", status: "ERR", body: String(e) });
    }
    setBusy("");
  }, [initialVideos, push, staticMode]);

  const runPost = useCallback(async () => {
    if (staticMode) {
      push({
        method: "POST",
        url: "/api/videos",
        status: "—",
        body: "静态部署没有后端，写入操作不可用。本地跑 npm run dev 时可正常使用。",
      });
      return;
    }
    setBusy("post");
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE),
      });
      const data = await res.json();
      createdRef.current = data.video?.id ?? null;
      push({
        method: "POST",
        url: "/api/videos",
        status: res.status,
        body: data.video
          ? { 新建id: data.video.id, 标题: data.video.title }
          : data,
      });
    } catch (e) {
      push({ method: "POST", url: "/api/videos", status: "ERR", body: String(e) });
    }
    setBusy("");
  }, [push, staticMode]);

  const runDelete = useCallback(async () => {
    if (staticMode) {
      push({
        method: "DELETE",
        url: "/api/videos/:id",
        status: "—",
        body: "静态部署没有后端，删除操作不可用。本地跑 npm run dev 时可正常使用。",
      });
      return;
    }
    const id = createdRef.current;
    if (!id) {
      push({
        method: "DELETE",
        url: "/api/videos/:id",
        status: "—",
        body: "还没有可删除的记录，先点一次「新增一条」。",
      });
      return;
    }
    setBusy("delete");
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      const data = await res.json();
      push({
        method: "DELETE",
        url: `/api/videos/${id}`,
        status: res.status,
        body: data,
      });
      createdRef.current = null;
    } catch (e) {
      push({
        method: "DELETE",
        url: `/api/videos/${id}`,
        status: "ERR",
        body: String(e),
      });
    }
    setBusy("");
  }, [push, staticMode]);

  return (
    <div className="playground">
      <div className="pg-head">
        <h3>
          接口调试面板
          {staticMode && <span className="pg-mode">静态部署</span>}
        </h3>
        <p>
          {staticMode
            ? "当前是静态部署，没有后端进程：读取走构建时的数据快照，写入/删除不可用（本地 npm run dev 时三个按钮都能真的操作数据库）。"
            : "下面三个按钮会真的去请求本项目的后端接口，并把返回结果显示出来。新增的记录可以一键删掉，不会留垃圾数据。"}
        </p>
      </div>

      <div className="pg-buttons">
        <button className="chip" onClick={runGet} disabled={busy === "get"}>
          {busy === "get" ? "请求中…" : "GET /api/videos"}
        </button>
        <button className="chip" onClick={runPost} disabled={busy === "post"}>
          {busy === "post" ? "请求中…" : "POST 新增一条"}
        </button>
        <button
          className="chip"
          onClick={runDelete}
          disabled={busy === "delete"}
        >
          {busy === "delete" ? "请求中…" : "DELETE 删掉它"}
        </button>
      </div>

      <div className="pg-log">
        {logs.length === 0 ? (
          <p className="pg-empty">还没有请求记录，点上面任意一个按钮试试。</p>
        ) : (
          logs.map((l, i) => (
            <div className="pg-item" key={i}>
              <div className="pg-line">
                <span className={`pg-method m-${l.method.toLowerCase()}`}>
                  {l.method}
                </span>
                <span className="pg-url">{l.url}</span>
                <span className="pg-status">{l.status}</span>
                <span className="pg-time">{l.t}</span>
              </div>
              <pre>{JSON.stringify(l.body, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

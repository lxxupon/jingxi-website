"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_LAYERS, getEngine } from "@/lib/audio";
import { getPosition, markDone, savePosition } from "@/lib/progress";

function fmt(sec) {
  if (!Number.isFinite(sec)) return "--:--";
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function VideoPlayer({ video }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [done, setDone] = useState(false);
  const [ambient, setAmbient] = useState("");
  const [resumed, setResumed] = useState(false);

  const id = video.id;

  // 恢复上次播放位置
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const saved = getPosition(id);
    if (saved > 3) {
      const onMeta = () => {
        if (saved < el.duration - 5) {
          el.currentTime = saved;
          setResumed(true);
        }
      };
      el.addEventListener("loadedmetadata", onMeta, { once: true });
      return () => el.removeEventListener("loadedmetadata", onMeta);
    }
  }, [id]);

  const persist = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    savePosition(id, el.currentTime);
  }, [id]);

  // 每 5 秒记一次位置，离开页面时也记一次
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(persist, 5000);
    return () => clearInterval(t);
  }, [persist, playing]);

  useEffect(() => {
    return () => persist();
  }, [persist]);

  const onEnded = useCallback(() => {
    setPlaying(false);
    markDone(id);
    setDone(true);
    persist();
  }, [id, persist]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch((e) => setError(e?.message || "播放失败"));
    } else {
      el.pause();
      persist();
    }
  }, [persist]);

  const restart = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    setTime(0);
    el.play().catch(() => {});
  }, []);

  const jump = useCallback((delta) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.min(
      Math.max(0, el.currentTime + delta),
      el.duration || 0
    );
  }, []);

  const pickAmbient = useCallback(async (next) => {
    const engine = getEngine();
    if (!engine) return;
    await engine.init();
    engine.stopAll();
    if (next && next !== ambient) {
      await engine.enable(next);
      setAmbient(next);
    } else {
      setAmbient("");
    }
  }, [ambient]);

  useEffect(() => () => getEngine()?.stopAll(), []);

  const percent = duration ? (time / duration) * 100 : 0;

  return (
    <div className="player-shell">
      <div className={`player ${ready ? "is-ready" : ""}`}>
        {error ? (
          <div className="player-error">
            <p>{error}</p>
            <div className="pe-actions">
              <button className="chip on" onClick={() => window.location.reload()}>
                重新加载
              </button>
              <a className="chip" href={video.video_url} target="_blank" rel="noopener noreferrer">
                直接下载
              </a>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="player-video"
              playsInline
              preload="metadata"
              poster={video.cover || undefined}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration || 0);
                setReady(true);
              }}
              onError={() => setError("视频加载失败，可能是浏览器不支持 WebM 格式。")}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onEnded={onEnded}
              onClick={toggle}
            >
              <source src={video.video_url} />
              您的浏览器不支持 HTML5 video。
            </video>

            {!playing && ready && (
              <button className="player-overlay" onClick={toggle} aria-label="播放">
                <span className="po-circle">{done ? "再看一次" : "▶"}</span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="player-bar">
        <div className="pb-track" onClick={(e) => {
          const el = videoRef.current;
          if (!el || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          el.currentTime = ratio * duration;
        }}>
          <span className="pb-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="pb-row">
          <span className="pb-time">
            {fmt(time)} / {fmt(duration)}
          </span>
          <div className="pb-buttons">
            <button onClick={() => jump(-10)} title="后退 10 秒">« 10s</button>
            <button className="pb-main" onClick={toggle}>
              {playing ? "暂停" : "播放"}
            </button>
            <button onClick={() => jump(10)} title="前进 10 秒">10s »</button>
            <button onClick={restart}>从头开始</button>
          </div>
          <div className="pb-ambient">
            <span className="pb-label">配一层环境音</span>
            <select value={ambient} onChange={(e) => pickAmbient(e.target.value)}>
              <option value="">关闭</option>
              {AMBIENT_LAYERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {resumed && (
          <p className="pb-note">已帮你跳到上次看到的位置。</p>
        )}
        {done && <p className="pb-note ok">已记入「已完成」。</p>}
      </div>
    </div>
  );
}

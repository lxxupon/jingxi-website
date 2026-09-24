"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_LAYERS, getEngine } from "@/lib/audio";
import { fmtTime } from "@/lib/patterns";

const PRESETS = [
  { id: "sleep", name: "入睡前", layers: ["rain", "hush"], minutes: 30 },
  { id: "focus", name: "专注时", layers: ["wind", "hush"], minutes: 0 },
  { id: "noon", name: "午后小歇", layers: ["stream"], minutes: 15 },
  { id: "sea", name: "海边发呆", layers: ["waves"], minutes: 0 },
];

const TIMERS = [
  { value: 0, label: "不限" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 60, label: "60 分钟" },
];

export default function AmbientSection() {
  const [on, setOn] = useState([]); // 正在播放的层 id
  const [volume, setVolume] = useState(0.6);
  const [timer, setTimer] = useState(0); // 分钟，0 = 不限
  const [left, setLeft] = useState(0); // 剩余秒
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const tickRef = useRef(0);

  const stopAll = useCallback(() => {
    const engine = getEngine();
    engine?.stopAll();
    setOn([]);
    setLeft(0);
    clearInterval(tickRef.current);
    tickRef.current = 0;
  }, []);

  const toggleLayer = useCallback(
    async (id) => {
      const engine = getEngine();
      if (!engine) {
        setError("当前浏览器不支持 Web Audio");
        return;
      }
      try {
        await engine.init();
        setReady(true);
        if (engine.isOn(id)) {
          engine.disable(id);
          setOn((prev) => prev.filter((x) => x !== id));
        } else {
          await engine.enable(id);
          setOn((prev) => [...prev, id]);
        }
      } catch (e) {
        setError(e?.message || "音频启动失败，请再点一次");
      }
    },
    []
  );

  const applyPreset = useCallback(
    async (preset) => {
      const engine = getEngine();
      if (!engine) return;
      try {
        await engine.init();
        setReady(true);
        engine.stopAll();
        for (const id of preset.layers) await engine.enable(id);
        setOn(preset.layers);
        setTimer(preset.minutes);
        setLeft(preset.minutes * 60);
      } catch (e) {
        setError(e?.message || "音频启动失败");
      }
    },
    []
  );

  // 音量
  useEffect(() => {
    getEngine()?.setVolume(volume);
  }, [volume]);

  // 关闭定时（只在「有声音在放」这件事变化时重启计时，加减层数不会打断）
  const playing = on.length > 0;
  useEffect(() => {
    clearInterval(tickRef.current);
    tickRef.current = 0;
    if (!playing || timer === 0) {
      setLeft(0);
      return;
    }
    setLeft(timer * 60);
    tickRef.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(tickRef.current);
          tickRef.current = 0;
          getEngine()?.stopAll();
          setOn([]);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [playing, timer]);

  // 频谱可视化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const engine = getEngine();
      const data = engine?.active ? engine.spectrum() : null;
      const bars = 48;
      const gap = 3;
      const bw = (w - gap * (bars - 1)) / bars;
      for (let i = 0; i < bars; i++) {
        let v = 0.08;
        if (data) {
          const idx = Math.floor((i / bars) * (data.length * 0.55));
          v = Math.max(0.06, (data[idx] || 0) / 255);
        }
        const bh = Math.max(3, v * h);
        const x = i * (bw + gap);
        ctx.fillStyle = on.length
          ? "rgba(61,138,90,0.55)"
          : "rgba(61,138,90,0.16)";
        roundRect(ctx, x, h - bh, bw, bh, bw / 2);
        ctx.fill();
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  useEffect(() => () => getEngine()?.stopAll(), []);

  return (
    <section className="ambient" id="ambient">
      <div className="container">
        <div className="ambient-inner">
          <div className="ambient-left">
            <p className="gallery-kicker">环境音</p>
            <h2 className="gallery-title">给此刻铺一层底噪</h2>
            <p className="ambient-desc">
              全部由浏览器实时合成，不加载任何音频文件，断网也能听。
              可以叠加，也可以只开一层。
            </p>

            <div className="layer-grid">
              {AMBIENT_LAYERS.map((l) => {
                const active = on.includes(l.id);
                return (
                  <button
                    key={l.id}
                    className={`layer-btn ${active ? "on" : ""}`}
                    onClick={() => toggleLayer(l.id)}
                    aria-pressed={active}
                  >
                    <span className="layer-wave">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="layer-name">{l.name}</span>
                    <span className="layer-hint">{l.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="ambient-controls">
              <div className="vol-row">
                <span className="opt-label">音量</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="vol"
                  aria-label="音量"
                />
                <span className="vol-num">{Math.round(volume * 100)}</span>
              </div>

              <div className="timer-row">
                <span className="opt-label">定时关闭</span>
                <div className="chip-row">
                  {TIMERS.map((t) => (
                    <button
                      key={t.value}
                      className={`chip ${timer === t.value ? "on" : ""}`}
                      onClick={() => setTimer(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ambient-foot">
              {on.length > 0 ? (
                <>
                  <span className="af-state">
                    <span className="af-dot" />
                    正在播放 {on.length} 层
                    {left > 0 && ` · 还剩 ${fmtTime(left)}`}
                  </span>
                  <button className="chip" onClick={stopAll}>
                    全部停止
                  </button>
                </>
              ) : (
                <span className="af-state af-idle">
                  选一层声音，或者直接用下面的组合
                </span>
              )}
            </div>

            {error && <p className="ambient-error">{error}</p>}
          </div>

          <div className="ambient-right">
            <div className="viz-card">
              <canvas ref={canvasRef} width="360" height="150" />
              <div className="viz-caption">
                {ready
                  ? on.length
                    ? "实时波形"
                    : "已就绪，等待播放"
                  : "点击任意声音即会启动"}
              </div>
            </div>

            <div className="preset-card">
              <p className="preset-title">组合</p>
              <div className="preset-list">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className="preset-item"
                    onClick={() => applyPreset(p)}
                  >
                    <span className="pi-name">{p.name}</span>
                    <span className="pi-meta">
                      {p.layers
                        .map(
                          (id) =>
                            AMBIENT_LAYERS.find((l) => l.id === id)?.name || id
                        )
                        .join(" + ")}
                      {p.minutes ? ` · ${p.minutes} 分钟后停` : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PATTERNS, getPattern, patternCycle, fmtTime } from "@/lib/patterns";
import { getEngine } from "@/lib/audio";
import { addSession, summarize, recentDays } from "@/lib/stats";

const DURATIONS = [
  { value: 1, label: "1 分钟" },
  { value: 3, label: "3 分钟" },
  { value: 5, label: "5 分钟" },
  { value: 10, label: "10 分钟" },
  { value: 0, label: "不限" },
];

/** 根据累计毫秒，算出当前处于哪个阶段、阶段进度、圆的缩放。 */
function phaseAt(pattern, totalMs) {
  const cycleMs = patternCycle(pattern) * 1000;
  let within = totalMs % cycleMs;
  const round = Math.floor(totalMs / cycleMs);
  for (let i = 0; i < pattern.phases.length; i++) {
    const ph = pattern.phases[i];
    const dur = ph.sec * 1000;
    if (within < dur) {
      const progress = within / dur;
      return {
        index: i,
        phase: ph,
        progress,
        remaining: ph.sec - within / 1000,
        scale: ph.from + (ph.to - ph.from) * progress,
        round,
      };
    }
    within -= dur;
  }
  const last = pattern.phases[pattern.phases.length - 1];
  return {
    index: pattern.phases.length - 1,
    phase: last,
    progress: 1,
    remaining: 0,
    scale: last.to,
    round,
  };
}

export default function BreathSection() {
  const [patternId, setPatternId] = useState("478");
  const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState([]);

  const pattern = useMemo(() => getPattern(patternId), [patternId]);
  const cycle = patternCycle(pattern);

  const rafRef = useRef(0);
  const runRef = useRef({ startAt: 0, accMs: 0, lastPhase: -1 });

  // 本地记录只在客户端读取，避免 SSR 水合不一致
  useEffect(() => {
    setStats(summarize());
    setDays(recentDays(undefined, 14));
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const finish = useCallback(
    (totalMs) => {
      stopLoop();
      runRef.current.accMs = 0;
      setRunning(false);
      setPaused(false);
      const seconds = totalMs / 1000;
      const rounds = Math.floor(seconds / cycle);
      addSession(seconds, patternId);
      setStats(summarize());
      setDays(recentDays(undefined, 14));
      setFinished({ seconds, rounds });
      if (soundOn) getEngine()?.chime("bell").catch(() => {});
    },
    [cycle, patternId, soundOn, stopLoop]
  );

  const loop = useCallback(() => {
    const st = runRef.current;
    const totalMs = st.accMs + (performance.now() - st.startAt);
    setElapsedMs(totalMs);

    const cur = phaseAt(pattern, totalMs);
    if (soundOn && cur.index !== st.lastPhase) {
      st.lastPhase = cur.index;
      getEngine()
        ?.chime(cur.phase.key === "exhale" ? "out" : "in")
        .catch(() => {});
    }

    if (minutes > 0 && totalMs >= minutes * 60 * 1000) {
      setElapsedMs(minutes * 60 * 1000);
      finish(minutes * 60 * 1000);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [finish, minutes, pattern, soundOn]);

  const start = useCallback(() => {
    if (running && !paused) return;
    setFinished(null);
    const st = runRef.current;
    if (!running) {
      st.accMs = 0;
      st.lastPhase = -1;
      setElapsedMs(0);
    }
    st.startAt = performance.now();
    setRunning(true);
    setPaused(false);
    if (soundOn) getEngine()?.init();
    stopLoop();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, paused, running, soundOn, stopLoop]);

  const pause = useCallback(() => {
    if (!running || paused) return;
    runRef.current.accMs += performance.now() - runRef.current.startAt;
    stopLoop();
    setPaused(true);
  }, [paused, running, stopLoop]);

  const reset = useCallback(() => {
    stopLoop();
    runRef.current.accMs = 0;
    runRef.current.lastPhase = -1;
    setRunning(false);
    setPaused(false);
    setElapsedMs(0);
    setFinished(null);
  }, [stopLoop]);

  const applyPattern = useCallback((id) => {
    setPatternId(id);
    const p = getPattern(id);
    if (DURATIONS.some((d) => d.value === p.defaultMinutes)) {
      setMinutes(p.defaultMinutes);
    }
  }, []);

  const pickPattern = useCallback(
    (id) => {
      reset();
      applyPattern(id);
    },
    [applyPattern, reset]
  );

  // 首页 Hero / 结语区的「开始一次呼吸」按钮会派发这个事件
  useEffect(() => {
    function onRemoteStart(e) {
      if (e?.detail?.pattern) applyPattern(e.detail.pattern);
      reset();
      setTimeout(() => start(), 60);
    }
    window.addEventListener("jingxi:breath-start", onRemoteStart);
    return () =>
      window.removeEventListener("jingxi:breath-start", onRemoteStart);
  }, [applyPattern, reset, start]);

  const cur = phaseAt(pattern, elapsedMs);
  const targetMs = minutes > 0 ? minutes * 60 * 1000 : cycle * 1000;
  const overall = Math.min(1, elapsedMs / targetMs);
  const shownSeconds = Math.max(1, Math.ceil(cur.remaining));

  const R = 148;
  const C = 2 * Math.PI * R;

  return (
    <section className="breath" id="breath">
      <div className="container">
        <div className="breath-header">
          <p className="breath-kicker">呼吸引导</p>
          <h2 className="breath-title">跟随圆的节奏</h2>
          <p className="breath-subtitle">
            选一种节奏，点开始，剩下的交给圆。它变大时吸气，变小时呼气。
          </p>
        </div>

        <div className="breath-body">
          <div className="circle-wrap">
            <div className="circle-glow" />
            <div className="breath-stage">
              <svg className="breath-progress" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r={R} className="bp-track" />
                <circle
                  cx="160"
                  cy="160"
                  r={R}
                  className="bp-bar"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - overall)}
                  transform="rotate(-90 160 160)"
                />
              </svg>

              <div className="ring guide guide-1" />
              <div className="ring guide guide-2" />
              <div className="ring guide guide-3" />

              <div
                className="breath-orb"
                style={{
                  transform: `scale(${(running ? cur.scale : 0.78).toFixed(4)})`,
                }}
              >
                <div className="orb-core" />
              </div>

              <div className="breath-readout">
                {running ? (
                  <>
                    <span className="ro-phase">
                      {paused ? "已暂停" : cur.phase.label}
                    </span>
                    <span className="ro-count">
                      {paused ? "‖" : shownSeconds}
                    </span>
                    <span className="ro-unit">
                      {paused ? "随时继续" : "秒"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="ro-phase">准备好了吗</span>
                    <span className="ro-count ro-count-sm">{pattern.short}</span>
                    <span className="ro-unit">一次循环 {cycle} 秒</span>
                  </>
                )}
              </div>
            </div>

            <div className="breath-meta">
              <span className="bm-item">
                <em>{fmtTime(elapsedMs / 1000)}</em>
                <i>{minutes > 0 ? `目标 ${minutes} 分钟` : "不限时长"}</i>
              </span>
              <span className="bm-div" />
              <span className="bm-item">
                <em>{elapsedMs > 0 ? cur.round + 1 : 0}</em>
                <i>已完成轮次</i>
              </span>
              <span className="bm-div" />
              <span className="bm-item">
                <em>{pattern.name}</em>
                <i>{pattern.best}</i>
              </span>
            </div>

            <div className="breath-controls">
              {!running ? (
                <button className="breath-start primary" onClick={start}>
                  开始一次呼吸
                </button>
              ) : (
                <>
                  <button
                    className="breath-start primary"
                    onClick={paused ? start : pause}
                  >
                    {paused ? "继续" : "暂停"}
                  </button>
                  <button className="breath-start" onClick={reset}>
                    结束
                  </button>
                </>
              )}
            </div>

            <div className="breath-options">
              <div className="opt-row">
                <span className="opt-label">时长</span>
                <div className="chip-row">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      className={`chip ${minutes === d.value ? "on" : ""}`}
                      onClick={() => {
                        reset();
                        setMinutes(d.value);
                      }}
                      disabled={running && !paused}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="opt-row">
                <span className="opt-label">提示音</span>
                <button
                  className={`switch ${soundOn ? "on" : ""}`}
                  onClick={() => setSoundOn((v) => !v)}
                  aria-pressed={soundOn}
                >
                  <span className="switch-knob" />
                  <span className="switch-text">{soundOn ? "开" : "关"}</span>
                </button>
              </div>
            </div>

            <p className="breath-tip">提示：{pattern.tip}</p>

            {finished && (
              <div className="breath-done">
                <p className="done-title">这一轮结束了</p>
                <p className="done-sub">
                  你刚刚安静了 {fmtTime(finished.seconds)}，完成了{" "}
                  {finished.rounds} 次完整呼吸。
                </p>
                <div className="done-actions">
                  <button className="chip on" onClick={start}>
                    再来一次
                  </button>
                  <button className="chip" onClick={() => setFinished(null)}>
                    收起
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="breath-right">
            <div className="pattern-cards">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  className={`pattern-card ${p.id === patternId ? "active" : ""}`}
                  onClick={() => pickPattern(p.id)}
                  aria-pressed={p.id === patternId}
                >
                  <span className="card-rhythm">{p.short}</span>
                  <span className="card-text">
                    <span className="card-title">{p.name}</span>
                    <span className="card-desc">{p.desc}</span>
                  </span>
                  <span className="card-meta">
                    <span className="card-time">{p.defaultMinutes} min</span>
                    {p.id === "478" && <span className="card-tag">推荐</span>}
                  </span>
                </button>
              ))}
            </div>

            <div className="practice-stats">
              <div className="ps-head">
                <span>我的静息记录</span>
                <span className="ps-note">仅保存在本机浏览器</span>
              </div>
              {stats ? (
                <>
                  <div className="ps-grid">
                    <div className="ps-cell">
                      <em>{Math.round(stats.todaySeconds / 60)}</em>
                      <i>今日分钟</i>
                    </div>
                    <div className="ps-cell">
                      <em>{stats.streak}</em>
                      <i>连续天数</i>
                    </div>
                    <div className="ps-cell">
                      <em>{Math.round(stats.totalSeconds / 60)}</em>
                      <i>累计分钟</i>
                    </div>
                    <div className="ps-cell">
                      <em>{stats.sessions}</em>
                      <i>练习次数</i>
                    </div>
                  </div>
                  <div className="ps-bars">
                    {days.map((d) => (
                      <span
                        key={d.date}
                        className={`ps-bar ${d.seconds > 0 ? "on" : ""}`}
                        style={{
                          height: `${Math.min(
                            100,
                            16 + Math.round(d.seconds / 6)
                          )}%`,
                        }}
                        title={`${d.date} · ${Math.round(d.seconds / 60)} 分钟`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="ps-loading">读取中…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

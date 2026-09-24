/**
 * 呼吸模式定义。
 * phases 中每一段的 sec 为该阶段持续秒数（支持小数）。
 * 圆的大小规则：inhale 变大、exhale 变小、hold 保持不变。
 */
export const PATTERNS = [
  {
    id: "478",
    name: "4-7-8 呼吸法",
    short: "4 · 7 · 8",
    desc: "吸气 4 秒，屏息 7 秒，呼气 8 秒。缓解焦虑，帮助入眠。",
    tip: "呼气时把嘴唇轻轻拢起，让气流细而长地送出。",
    best: "入睡前 · 焦虑时",
    phases: [
      { key: "inhale", label: "吸气", sec: 4, from: 0.62, to: 1 },
      { key: "hold", label: "屏息", sec: 7, from: 1, to: 1 },
      { key: "exhale", label: "呼气", sec: 8, from: 1, to: 0.62 },
    ],
    defaultMinutes: 3,
  },
  {
    id: "box",
    name: "盒式呼吸",
    short: "4 · 4 · 4 · 4",
    desc: "吸气、屏息、呼气、屏息各 4 秒，围成一个稳定的方块。提升专注，平衡情绪。",
    tip: "想象指尖沿着一个正方形的四条边，匀速地描一圈。",
    best: "工作前 · 需要专注时",
    phases: [
      { key: "inhale", label: "吸气", sec: 4, from: 0.62, to: 1 },
      { key: "hold", label: "屏息", sec: 4, from: 1, to: 1 },
      { key: "exhale", label: "呼气", sec: 4, from: 1, to: 0.62 },
      { key: "hold", label: "屏息", sec: 4, from: 0.62, to: 0.62 },
    ],
    defaultMinutes: 4,
  },
  {
    id: "belly",
    name: "腹式呼吸",
    short: "5 · 5",
    desc: "手放腹部，吸气时把肚子轻轻顶起来，呼气时慢慢收回去。深度放松，释放紧绷。",
    tip: "肩膀不要抬。起伏应该发生在肚子上，而不是胸口。",
    best: "久坐后 · 身体紧绷时",
    phases: [
      { key: "inhale", label: "吸气", sec: 5, from: 0.6, to: 1 },
      { key: "exhale", label: "呼气", sec: 5, from: 1, to: 0.6 },
    ],
    defaultMinutes: 5,
  },
  {
    id: "calm",
    name: "舒缓呼吸",
    short: "4 · 6",
    desc: "吸气 4 秒，呼气 6 秒。呼气比吸气长，是让身体松下来最直接的开关。",
    tip: "如果 6 秒太长，先做 4-4，再一点点延长呼气。",
    best: "任何时刻 · 想慢下来",
    phases: [
      { key: "inhale", label: "吸气", sec: 4, from: 0.66, to: 1 },
      { key: "exhale", label: "呼气", sec: 6, from: 1, to: 0.66 },
    ],
    defaultMinutes: 3,
  },
];

export function getPattern(id) {
  return PATTERNS.find((p) => p.id === id) || PATTERNS[0];
}

/** 一个完整循环的秒数。 */
export function patternCycle(p) {
  return p.phases.reduce((s, ph) => s + ph.sec, 0);
}

/** 把总秒数换算成 mm:ss。 */
export function fmtTime(totalSec) {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

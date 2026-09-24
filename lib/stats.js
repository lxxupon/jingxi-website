/**
 * 练习记录（纯本地，存在 localStorage，不上传任何数据）。
 * 结构：{ days: { 'YYYY-MM-DD': 秒数 }, total: 秒, sessions: 次数, lastPattern }
 */

const KEY = "jingxi:stats";

const EMPTY = { days: {}, total: 0, sessions: 0, lastPattern: null };

function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function shiftDay(key, delta) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayKey(dt);
}

export function loadStats() {
  if (typeof window === "undefined") return { ...EMPTY, days: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, days: {} };
    const parsed = JSON.parse(raw);
    return {
      days: parsed.days || {},
      total: parsed.total || 0,
      sessions: parsed.sessions || 0,
      lastPattern: parsed.lastPattern || null,
    };
  } catch {
    return { ...EMPTY, days: {} };
  }
}

function saveStats(s) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 隐私模式下忽略 */
  }
}

/** 记录一次完成的练习，seconds 为实际时长。 */
export function addSession(seconds, patternId) {
  const s = loadStats();
  const key = todayKey();
  const add = Math.round(seconds);
  s.days[key] = (s.days[key] || 0) + add;
  s.total += add;
  s.sessions += 1;
  s.lastPattern = patternId || s.lastPattern;
  saveStats(s);
  return s;
}

export function resetStats() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return { ...EMPTY, days: {} };
}

/** 连续练习天数：今天没练则从昨天往前算。 */
export function computeStreak(days) {
  let cursor = todayKey();
  if (!days[cursor]) cursor = shiftDay(cursor, -1);
  let streak = 0;
  while (days[cursor] && days[cursor] > 0) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function summarize(stats = loadStats()) {
  const today = todayKey();
  return {
    todaySeconds: stats.days[today] || 0,
    totalSeconds: stats.total,
    sessions: stats.sessions,
    streak: computeStreak(stats.days),
    lastPattern: stats.lastPattern,
    days: stats.days,
  };
}

/** 最近 n 天的数组，用于画小小的进度条。 */
export function recentDays(stats = loadStats(), n = 14) {
  const out = [];
  let cursor = todayKey();
  for (let i = 0; i < n; i++) {
    out.unshift({ date: cursor, seconds: stats.days[cursor] || 0 });
    cursor = shiftDay(cursor, -1);
  }
  return out;
}

export { todayKey };

/**
 * 引导练习的学习进度（纯本地 localStorage）：
 * 收藏、已完成、上次播放位置。
 */

const KEY = "jingxi:progress";
const EMPTY = { favs: [], done: [], positions: {} };

function load() {
  if (typeof window === "undefined") return { ...EMPTY, favs: [], done: [], positions: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { favs: [], done: [], positions: {} };
    const p = JSON.parse(raw);
    return {
      favs: p.favs || [],
      done: p.done || [],
      positions: p.positions || {},
    };
  } catch {
    return { favs: [], done: [], positions: {} };
  }
}

function save(p) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function getProgress() {
  return load();
}

export function toggleFav(id) {
  const p = load();
  const key = String(id);
  p.favs = p.favs.includes(key)
    ? p.favs.filter((x) => x !== key)
    : [...p.favs, key];
  save(p);
  return p;
}

export function markDone(id) {
  const p = load();
  const key = String(id);
  if (!p.done.includes(key)) p.done = [...p.done, key];
  save(p);
  return p;
}

export function unmarkDone(id) {
  const p = load();
  p.done = p.done.filter((x) => x !== String(id));
  save(p);
  return p;
}

export function savePosition(id, seconds) {
  const p = load();
  p.positions[String(id)] = Math.max(0, Math.round(seconds));
  save(p);
  return p;
}

export function getPosition(id) {
  return load().positions[String(id)] || 0;
}

import { getDb } from "./db.js";
import { buildSeedList } from "./seed-data.js";

/**
 * node:sqlite 返回的行是 null-prototype 对象，不能直接传给客户端组件，
 * 这里统一转成普通对象。
 */
function plain(row) {
  if (!row) return row;
  return JSON.parse(JSON.stringify(row));
}

/**
 * 数据库为空时自动灌入初始数据。
 * data/ 目录没有进版本库，CI 里拉下来就是一个空库，
 * 没有这一步，构建出来的页面会一条练习都没有。
 */
let _seeded = false;
function ensureSeeded() {
  if (_seeded) return;
  _seeded = true;
  try {
    const db = getDb();
    const { c } = db.prepare("SELECT COUNT(*) AS c FROM videos").get();
    if (c > 0) return;
    const stmt = db.prepare(`
      INSERT INTO videos
        (title, description, category, duration, cover, video_url, tips, credit, minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of buildSeedList()) {
      stmt.run(
        v.title,
        v.description ?? null,
        v.category ?? null,
        v.duration ?? null,
        v.cover ?? null,
        v.video_url,
        Array.isArray(v.tips) ? JSON.stringify(v.tips) : v.tips ?? null,
        v.credit ?? null,
        v.minutes ?? null
      );
    }
  } catch {
    /* 只读环境等情况下忽略，页面会退化成空列表 */
  }
}

/** 列出全部教学视频（按创建时间倒序）。 */
export function listVideos() {
  ensureSeeded();
  const db = getDb();
  return db
    .prepare("SELECT * FROM videos ORDER BY created_at DESC, id DESC")
    .all()
    .map(plain);
}

/** 按 id 获取单条视频。 */
export function getVideoById(id) {
  ensureSeeded();
  const db = getDb();
  return plain(db.prepare("SELECT * FROM videos WHERE id = ?").get(Number(id)));
}

/** 新增一条教学视频，返回新建记录。 */
export function createVideo({
  title,
  description = null,
  category = null,
  duration = null,
  cover = null,
  video_url,
  tips = null,
  credit = null,
  minutes = null,
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO videos
      (title, description, category, duration, cover, video_url, tips, credit, minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    title,
    description,
    category,
    duration,
    cover,
    video_url,
    typeof tips === "string" ? tips : tips ? JSON.stringify(tips) : null,
    credit,
    minutes
  );
  return getVideoById(info.lastInsertRowid);
}

/** 删除一条视频，返回是否删掉了。 */
export function deleteVideo(id) {
  const db = getDb();
  const info = db.prepare("DELETE FROM videos WHERE id = ?").run(Number(id));
  return info.changes > 0;
}

/** 当前视频数量（用于 seed 判断）。 */
export function countVideos() {
  const db = getDb();
  return db.prepare("SELECT COUNT(*) AS c FROM videos").get().c;
}

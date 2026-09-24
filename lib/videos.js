import { getDb } from "./db.js";

/**
 * node:sqlite 返回的行是 null-prototype 对象，不能直接传给客户端组件，
 * 这里统一转成普通对象。
 */
function plain(row) {
  if (!row) return row;
  return JSON.parse(JSON.stringify(row));
}

/** 列出全部教学视频（按创建时间倒序）。 */
export function listVideos() {
  const db = getDb();
  return db
    .prepare("SELECT * FROM videos ORDER BY created_at DESC, id DESC")
    .all()
    .map(plain);
}

/** 按 id 获取单条视频。 */
export function getVideoById(id) {
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

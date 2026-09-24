import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "jingxi.db");

let _db = null;

/**
 * 懒加载的单例 SQLite 连接（基于 Node 内置 node:sqlite，无需原生编译）。
 * 同时保证 videos 表结构存在。
 */
export function getDb() {
  if (_db) return _db;
  mkdirSync(DB_DIR, { recursive: true });
  _db = new DatabaseSync(DB_PATH);
  _db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT,
      category    TEXT,
      duration    TEXT,
      cover       TEXT,
      video_url   TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 轻量迁移：为旧库补上引导要点与素材署名两列
  for (const sql of [
    "ALTER TABLE videos ADD COLUMN tips TEXT",
    "ALTER TABLE videos ADD COLUMN credit TEXT",
    "ALTER TABLE videos ADD COLUMN minutes INTEGER",
  ]) {
    try {
      _db.exec(sql);
    } catch {
      /* 列已存在 */
    }
  }

  return _db;
}

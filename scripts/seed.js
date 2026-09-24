import { getDb } from "../lib/db.js";
import { countVideos, createVideo } from "../lib/videos.js";
import { buildSeedList } from "../lib/seed-data.js";

/**
 * 手动重建数据库： node scripts/seed.js [--reset]
 * 不加 --reset 时，库里已经有数据就什么都不做。
 * （运行时如果库是空的会自动灌入初始数据，见 lib/videos.js 的 ensureSeeded）
 */
function seed() {
  const reset = process.argv.includes("--reset");
  const db = getDb();

  if (reset) {
    db.exec("DELETE FROM videos");
    try {
      // 让 id 从 1 重新开始
      db.exec("DELETE FROM sqlite_sequence WHERE name = 'videos'");
    } catch {
      /* 表不存在时忽略 */
    }
    console.log("已清空 videos 表");
  }

  const existing = countVideos();
  if (existing > 0 && !reset) {
    console.log(`已存在 ${existing} 条引导练习，跳过 seed（加 --reset 可重置）`);
    return;
  }

  const list = buildSeedList();
  for (const v of list) createVideo(v);
  console.log(`已写入 ${list.length} 条引导练习`);
}

seed();

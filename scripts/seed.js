import { existsSync } from "node:fs";
import path from "node:path";
import { getDb } from "../lib/db.js";
import { countVideos, createVideo } from "../lib/videos.js";

const MEDIA_DIR = path.join(process.cwd(), "public", "assets", "media");

/**
 * 真实的自然影像 + 一段可照着做的引导要点。
 * 视频均来自 Wikimedia Commons（CC0 / CC BY / CC BY-SA，见 credit 字段）。
 */
const SEED = [
  {
    title: "海浪 · 观息练习",
    description:
      "把注意力交给一次次涌上来的浪。浪来时吸气，浪退时呼气。不需要调整呼吸，只需要看着它。",
    category: "观息",
    duration: "5 min",
    minutes: 5,
    cover: "/assets/photos/p7.jpg",
    video_url: "/assets/media/ocean.webm",
    credit: "Ocean surface waves 06 — Mostafameraji, Wikimedia Commons, CC0",
    tips: [
      "找个能靠住后背的姿势，肩膀松开。",
      "先看一分钟，不调整任何东西。",
      "浪涌起来时吸气，退下去时呼气，让呼吸跟着画面走。",
      "念头跑掉了，就把它当成一朵浪，让它自己退回去。",
    ],
  },
  {
    title: "流云 · 让念头飘过",
    description:
      "云一直在走，从不停留。练习把念头也当作云：看见它，然后让它过去，不追也不推。",
    category: "正念觉察",
    duration: "6 min",
    minutes: 6,
    cover: "/assets/photos/p8.jpg",
    video_url: "/assets/media/clouds.webm",
    credit: "2011-07-06 timelapse sky — Thomas Bresson, Wikimedia Commons, CC BY 3.0",
    tips: [
      "眼睛放松，不要盯着某一点用力看。",
      "每当发现自己走神，就在心里说一句「想了」，然后回到画面。",
      "走神不是失败，发现走神的那一刻才是练习。",
      "最后十秒，感受一下身体变沉了多少。",
    ],
  },
  {
    title: "溪流 · 身体扫描",
    description:
      "让注意力像水一样，从头顶慢慢流到脚底。经过哪里，就让哪里松一点。",
    category: "身体放松",
    duration: "8 min",
    minutes: 8,
    cover: "/assets/photos/p6.jpg",
    video_url: "/assets/media/stream.webm",
    credit:
      "Little Applegate River — Wikimedia Commons",
    tips: [
      "从额头开始，注意那里有没有不自觉地皱着。",
      "依次经过：下颌 → 肩膀 → 手 → 腹部 → 腿 → 脚。",
      "每个地方停两三次呼吸，不需要强行放松，只是注意到它。",
      "紧绷的地方，想象水从那里流过。",
    ],
  },
  {
    title: "瀑布 · 深度放松",
    description:
      "持续的白噪会把周围的杂音盖掉。适合累到不想思考的时候，只要看着水落下来。",
    category: "放松减压",
    duration: "4 min",
    minutes: 4,
    cover: "/assets/photos/p11.jpg",
    video_url: "/assets/media/fall.webm",
    credit:
      "Waterfall, Dingle Peninsula — Maoileann, Wikimedia Commons, CC BY-SA 4.0",
    tips: [
      "把视线放软，像发呆一样看着水。",
      "呼气比吸气长一点，哪怕只长一秒。",
      "如果坐不住，就先只做一分钟，之后再回来。",
    ],
  },
];

// 可选素材：下载到了就加进来
const OPTIONAL = [
  {
    file: "rain.webm",
    video: {
      title: "雨声 · 静坐",
      description:
        "窗外的雨会把空间填得很满，反而让人安静下来。适合闭眼静坐，什么都不做。",
      category: "静坐",
      duration: "10 min",
      minutes: 10,
      cover: "/assets/photos/p4.jpg",
      credit:
        "Raindrops on a window — Radevormwald, Wikimedia Commons",
      tips: [
        "闭上眼，只听雨。",
        "找到一个最远的声音，再找一个最近的。",
        "什么都不用做，剩下几分钟就坐着。",
      ],
    },
  },
  {
    file: "beach.webm",
    video: {
      title: "海滩 · 慢下来",
      description: "浪一遍遍刷过沙滩，节奏稳定得让人犯困。适合午休或睡前。",
      category: "放松减压",
      duration: "5 min",
      minutes: 5,
      cover: "/assets/photos/p3.jpg",
      credit:
        "Beach and waves from Eforie Sud — Wikimedia Commons",
      tips: ["让呼吸跟着浪的间隔走。", "数五次浪，看看能不能什么都不想。"],
    },
  },
];

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

  const list = [...SEED];
  for (const opt of OPTIONAL) {
    if (existsSync(path.join(MEDIA_DIR, opt.file))) {
      list.push({ ...opt.video, video_url: `/assets/media/${opt.file}` });
    }
  }

  for (const v of list) createVideo(v);
  console.log(`已写入 ${list.length} 条引导练习`);
}

seed();

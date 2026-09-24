/**
 * 每日一句。全部为可考证的原文（或通行译本），附作者与出处。
 * 每日一句按日期确定性选取，同一天刷新页面不会变；「换一句」则随机。
 */

export const QUOTES = [
  {
    text: "致虚极，守静笃。",
    author: "老子",
    source: "《道德经》第十六章",
    note: "把心放空到极致，把静守住到笃实。",
  },
  {
    text: "重为轻根，静为躁君。",
    author: "老子",
    source: "《道德经》第二十六章",
    note: "沉稳是轻率的根本，安静是躁动的主宰。",
  },
  {
    text: "知止而后有定，定而后能静，静而后能安，安而后能虑，虑而后能得。",
    author: "《大学》",
    source: "四书 · 大学",
    note: "先知道停在哪里，心才定得下来。",
  },
  {
    text: "非淡泊无以明志，非宁静无以致远。",
    author: "诸葛亮",
    source: "《诫子书》",
    note: "不清静寡欲，就走不远。",
  },
  {
    text: "结庐在人境，而无车马喧。问君何能尔？心远地自偏。",
    author: "陶渊明",
    source: "《饮酒 · 其五》",
    note: "安静不取决于地段，取决于心的距离。",
  },
  {
    text: "行到水穷处，坐看云起时。",
    author: "王维",
    source: "《终南别业》",
    note: "走到没路的地方，就坐下来看看云。",
  },
  {
    text: "回首向来萧瑟处，归去，也无风雨也无晴。",
    author: "苏轼",
    source: "《定风波》",
    note: "回头看那个让你狼狈的地方，其实什么也没有。",
  },
  {
    text: "无论海角与天涯，大抵心安即是家。",
    author: "白居易",
    source: "《种桃杏》",
    note: "心安的地方，就是家。",
  },
  {
    text: "不是风动，不是幡动，仁者心动。",
    author: "慧能",
    source: "《六祖坛经》",
    note: "动的从来不是外面的东西。",
  },
  {
    text: "水静则明，烛须眉，平中准，大匠取法焉。",
    author: "庄子",
    source: "《庄子 · 天道》",
    note: "水安静下来，才能照见一切。",
  },
  {
    text: "呼吸，是连接生命与意识的桥梁，它把你的身体与念头连在一起。每当心念散乱，就用呼吸重新握住它。",
    author: "一行禅师",
    source: "《正念的奇迹》",
    note: "心乱的时候，先找回呼吸。",
  },
  {
    text: "在正念中，人不但安歇而快乐，而且警觉而清醒。冥想不是逃避，而是与实相宁静地相遇。",
    author: "一行禅师",
    source: "《正念的奇迹》",
    note: "放松，不等于昏沉。",
  },
  {
    text: "不要为了把事情做完而做事。下定决心，以放松而全然专注的方式，去做手上的这一件事。",
    author: "一行禅师",
    source: "《正念的奇迹》",
    note: "慢一点，反而更快。",
  },
  {
    text: "我们每天都在经历一个奇迹，却浑然不觉：蓝天、白云、绿叶、孩子好奇的眼睛——还有我们自己的双眼。一切都是奇迹。",
    author: "一行禅师",
    source: "《正念的奇迹》",
    note: "奇迹不在远方，在你正在看的地方。",
  },
  {
    text: "当波浪意识到自己是水，生死便不再造成伤害。",
    author: "一行禅师",
    source: "《故道白云》",
    note: "认清自己是什么，就不怕形状的改变。",
  },
  {
    text: "正念，是有意识地、不加评判地，觉知当下这一刻。",
    author: "乔 · 卡巴金",
    source: "《正念：此刻是一枝花》",
    note: "三个要素：有意、当下、不评判。",
  },
  {
    text: "你无法阻止海浪，但你可以学会冲浪。",
    author: "乔 · 卡巴金",
    source: "《无论你去哪里，你都在那里》",
    note: "控制不了发生什么，但能练习怎么回应。",
  },
  {
    text: "那些小事？那些微小的片刻？它们一点也不小。",
    author: "乔 · 卡巴金",
    source: "《正念：此刻是一枝花》",
    note: "生活就是由这些「小」组成的。",
  },
  {
    text: "无论出了什么问题，只要还在呼吸，你身上对的地方，就比错的地方多。",
    author: "乔 · 卡巴金",
    source: "《多舛的生命》",
    note: "只要还在呼吸，就有余地。",
  },
  {
    text: "正念不是哲学，不是技巧，也不是某种特殊状态。它是一种存在的方式。",
    author: "乔 · 卡巴金",
    source: "《正念：此刻是一枝花》",
    note: "它不是你做的事，而是你做的方式。",
  },
  {
    text: "人四处寻找退隐之地，却不知道，最安宁的避难所就在自己的心里。",
    author: "马可 · 奥勒留",
    source: "《沉思录》第四卷",
    note: "随时可以退回到自己。",
  },
  {
    text: "我步入丛林，因为我希望从容地生活，只面对生活最本质的部分。",
    author: "亨利 · 戴维 · 梭罗",
    source: "《瓦尔登湖》",
    note: "把不必要的东西拿走，剩下的才是你。",
  },
  {
    text: "初学者的心中有许多可能性，专家的心中却很少。",
    author: "铃木俊隆",
    source: "《禅者的初心》",
    note: "每一次呼吸，都可以是第一次。",
  },
  {
    text: "伤口，是光进入你内心的通道。",
    author: "鲁米",
    source: "《芦笛之歌》",
    note: "裂开的地方，也是照进来的地方。",
  },
  {
    text: "生如夏花之绚烂，死如秋叶之静美。",
    author: "泰戈尔",
    source: "《飞鸟集》（郑振铎 译）",
    note: "热烈过，也安静地落下来。",
  },
];

function stableHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function dateKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 当天的句子（同一天固定不变）。 */
export function dailyQuote(d = new Date()) {
  return QUOTES[stableHash(dateKey(d)) % QUOTES.length];
}

/** 随机换一句，avoid 为当前展示的原文。 */
export function randomQuote(avoid) {
  if (QUOTES.length <= 1) return QUOTES[0];
  let q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  let guard = 0;
  while (q.text === avoid && guard++ < 10) {
    q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
  return q;
}

export { dateKey };

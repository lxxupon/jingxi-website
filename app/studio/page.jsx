import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApiPlayground from "@/components/ApiPlayground";
import { listVideos } from "@/lib/videos";

const MODULES = [
  {
    name: "前端展示层",
    tag: "app/",
    desc: "基于 Next.js App Router 的页面与路由：首页、引导练习列表、练习详情、网站设计说明页，天然支持 SSR 与服务端取数。",
    code: "app/page.jsx\napp/videos/page.jsx\napp/videos/[id]/page.jsx\napp/studio/page.jsx",
  },
  {
    name: "后端接口层",
    tag: "app/api/",
    desc: "以 Next.js Route Handlers 充当后端，对外提供引导练习的查询、新增与删除接口，前后端同仓、同语言。",
    code: "app/api/videos/route.js        (GET 列表 / POST 新增)\napp/api/videos/[id]/route.js   (GET 单条 / DELETE 删除)",
  },
  {
    name: "数据访问层",
    tag: "lib/",
    desc: "使用 Node 内置的 node:sqlite 作为数据库，无需额外原生编译。封装建表、列表、详情、新增、删除等数据操作。",
    code: "lib/db.js      (连接 + 建表 + 轻量迁移)\nlib/videos.js  (查询助手)",
  },
  {
    name: "交互与音频引擎",
    tag: "lib/ + components/",
    desc: "呼吸节拍器、环境音合成、练习记录、语录库、图库数据各自独立成模块；环境音全部由 Web Audio 实时合成，不加载音频文件。",
    code: "lib/patterns.js   呼吸节奏定义\nlib/audio.js      Web Audio 环境音合成\nlib/stats.js      练习记录(localStorage)\nlib/quotes.js     每日一句\nlib/photos.js     自然意境图库",
  },
];

export default function StudioPage() {
  const videos = listVideos();
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="kicker">网站设计</p>
            <h1>多模块全栈架构</h1>
            <p>
              原本挤在一个 index.html 里的页面，已重构为 Next.js
              多模块工程：展示、接口、数据、组件各司其职。后端用 SQLite
              存储引导练习，前端可流畅播放并记录进度。
            </p>
          </div>
        </section>

        <section className="studio">
          <div className="container">
            <div className="module-grid">
              {MODULES.map((m) => (
                <div className="module-card" key={m.name}>
                  <h3>
                    {m.name} <span className="tag">{m.tag}</span>
                  </h3>
                  <p>{m.desc}</p>
                  <code>{m.code}</code>
                </div>
              ))}
            </div>

            <div className="studio-note">
              <p>
                当前数据库里共有 <strong>{videos.length}</strong> 条引导练习。
                下面的面板会真的调用后端接口，可以直接看到返回结果。
              </p>
            </div>

            <ApiPlayground initialVideos={videos} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

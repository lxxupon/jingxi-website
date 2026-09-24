import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoPlayer from "@/components/VideoPlayer";
import VideoActions from "@/components/VideoActions";
import { getVideoById, listVideos } from "@/lib/videos";

/** 静态导出时预渲染所有详情页。 */
export function generateStaticParams() {
  return listVideos().map((v) => ({ id: String(v.id) }));
}

function parseTips(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return String(raw)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export default async function VideoDetailPage({ params }) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();

  const all = listVideos();
  const index = all.findIndex((v) => String(v.id) === String(video.id));
  const prev = index > 0 ? all[index - 1] : null;
  const next = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const tips = parseTips(video.tips);

  return (
    <>
      <Header />
      <main className="player-wrap">
        <div className="container">
          <Link href="/videos" className="back-link">
            ← 返回引导练习
          </Link>

          <VideoPlayer video={video} />

          <div className="player-info">
            <div className="pi-head">
              <h2>{video.title}</h2>
              <VideoActions id={video.id} />
            </div>
            <div className="meta">
              <span className="tag">{video.category || "引导"}</span>
              <span>{video.duration || ""}</span>
              {video.minutes ? <span>建议 {video.minutes} 分钟</span> : null}
            </div>
            <p className="desc">{video.description}</p>

            {tips.length > 0 && (
              <div className="tips">
                <h3>跟着做</h3>
                <ol>
                  {tips.map((t, i) => (
                    <li key={i}>
                      <span className="tip-num">{i + 1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {video.credit && (
              <p className="credit-line">素材：{video.credit}</p>
            )}

            <div className="detail-nav">
              {prev ? (
                <Link href={`/videos/${prev.id}`} className="dn-item">
                  <span className="dn-label">上一个</span>
                  <span className="dn-title">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/videos/${next.id}`} className="dn-item right">
                  <span className="dn-label">下一个</span>
                  <span className="dn-title">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

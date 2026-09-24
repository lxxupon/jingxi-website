import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoLibrary from "@/components/VideoLibrary";
import { listVideos } from "@/lib/videos";

export default function VideosPage() {
  const videos = listVideos();
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="kicker">引导练习</p>
            <h1>跟着画面，慢慢来</h1>
            <p>
              每段都是真实拍摄的自然影像，配一套可以照着做的引导要点。
              挑一个此刻最需要的，给自己几分钟。进度会记在本机，下次接着看。
            </p>
          </div>
        </section>
        <section className="video-teaser" style={{ paddingTop: 0 }}>
          <div className="container">
            <VideoLibrary videos={videos} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

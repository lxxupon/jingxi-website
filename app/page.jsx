import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BreathSection from "@/components/BreathSection";
import AmbientSection from "@/components/AmbientSection";
import GallerySection from "@/components/GallerySection";
import QuoteSection from "@/components/QuoteSection";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { listVideos } from "@/lib/videos";

export default function HomePage() {
  const videos = listVideos().slice(0, 3);
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BreathSection />
        <AmbientSection />
        <GallerySection />
        <section className="video-teaser" id="videos">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="gallery-kicker">引导练习</p>
                <h2 className="gallery-title">跟着画面，慢慢来</h2>
              </div>
              <Link href="/videos" className="gallery-hint">
                查看全部 →
              </Link>
            </div>
            <div className="video-grid">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>
        <QuoteSection />
      </main>
      <Footer />
    </>
  );
}

/**
 * 两种构建模式：
 *   1) 默认（不设 STATIC_EXPORT）：全栈模式，SQLite + API Route 都在，适合本地 / Node 服务器部署。
 *   2) STATIC_EXPORT=1：纯静态导出到 out/，可直接丢到 Cloudflare Pages / Workers 静态资源 / 任何 CDN。
 *      —— 数据库在构建时读取，页面预渲染成静态 HTML；所有交互功能仍在客户端正常工作。
 */
const isExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        // Cloudflare Pages 需要把 /videos/1 导出成 /videos/1/index.html 才能正确命中
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;

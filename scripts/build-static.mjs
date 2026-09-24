/**
 * 静态导出构建（用于 Cloudflare Pages / Workers 静态资源 / 任意 CDN）。
 *
 * 为什么要临时移走 app/api：
 *   Next 的 output:'export' 不支持 POST / DELETE 这类 Route Handler，
 *   构建期会直接报错。所以导出前先把整个 app/api 挪到项目根的 .api-backup
 *   （放在 app/ 之外，Next 就完全不会扫到它），构建结束后再挪回来，
 *   本地的全栈模式和线上静态模式共用同一份代码。
 */
import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiDir = path.join(root, "app", "api");
const bakDir = path.join(root, ".api-backup");

// Windows 上有时候上一次构建的 .next/trace 会残留成只读/被占用的状态，
// 再构建会报 EPERM。先清掉它，构建会自己重新生成。
const traceFile = path.join(root, ".next", "trace");
if (existsSync(traceFile) && statSync(traceFile).isFile()) {
  try {
    rmSync(traceFile, { force: true });
    console.log("· 已清理上次构建残留的 .next/trace");
  } catch {
    /* 清不掉就算了，让构建自己去试 */
  }
}

if (existsSync(bakDir) && !existsSync(apiDir)) {
  renameSync(bakDir, apiDir);
  console.log("· 恢复了上次未还原的 app/api");
}

const moved = existsSync(apiDir);
if (moved) {
  renameSync(apiDir, bakDir);
  console.log("· 已临时移除 app/api（静态导出不需要后端接口）");
}

// Windows 上 next 的 build-trace 步骤偶发 EPERM（.next/trace 被占用），
// 而且是「隔一次失败」的节奏，所以直接重试一次即可绕过。
const MAX_TRY = 3;
let failed = false;
for (let attempt = 1; attempt <= MAX_TRY; attempt++) {
  try {
    execFileSync(
      process.execPath,
      [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build"],
      {
        // stderr 用 pipe 收下来，才能判断是不是 .next/trace 的锁冲突
        stdio: ["inherit", "inherit", "pipe"],
        env: { ...process.env, STATIC_EXPORT: "1" },
      }
    );
    failed = false;
    break;
  } catch (e) {
    failed = true;
    const msg = `${String(e?.message || e)}\n${e?.stderr?.toString?.() || ""}`;
    const isTraceLock = msg.includes("EPERM") && msg.includes("trace");
    if (isTraceLock && attempt < MAX_TRY) {
      console.log(
        `\n· 遇到 .next/trace 锁冲突，清理后重试（第 ${attempt + 1} 次）…`
      );
      rmSync(traceFile, { force: true });
      continue;
    }
    console.error("构建失败：", msg);
    break;
  }
}

if (failed) {
  if (moved && existsSync(bakDir)) {
    renameSync(bakDir, apiDir);
    console.log("· 已还原 app/api");
  }
  process.exit(1);
}

if (moved && existsSync(bakDir)) {
  renameSync(bakDir, apiDir);
  console.log("· 已还原 app/api");
}

const out = path.join(root, "out");
if (existsSync(out)) {
  console.log(`\n✅ 静态站点已生成在 ${path.relative(root, out) || "out"}/`);
  console.log("   部署到 Cloudflare Pages： npm run deploy:pages");
}

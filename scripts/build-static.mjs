import { cp, mkdir, copyFile, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

await copyFile("index.html", "dist/index.html");
await copyFile("styles.css", "dist/styles.css");

await cp("src", "dist/src", { recursive: true });
await cp("data", "dist/data", { recursive: true });
await cp("public", "dist/public", { recursive: true });
await cp("docs", "dist/docs", { recursive: true });
await rm("dist/src/.DS_Store", { force: true });

try {
  await copyFile("logo.png", "dist/logo.png");
} catch {}

try {
  await copyFile("README.md", "dist/README.md");
} catch {}

console.log("Static site copied to dist/");

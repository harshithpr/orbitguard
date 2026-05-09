import { cp, mkdir, copyFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });

await copyFile("index.html", "dist/index.html");
await copyFile("styles.css", "dist/styles.css");

await cp("src", "dist/src", { recursive: true });
await cp("data", "dist/data", { recursive: true });
await cp("public", "dist/public", { recursive: true });

try {
  await copyFile("logo.png", "dist/logo.png");
} catch {}

console.log("Static site copied to dist/");

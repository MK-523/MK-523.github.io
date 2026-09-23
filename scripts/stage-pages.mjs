import { cp, readdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// GitHub Pages serves the repository root. Only these generated paths are replaced;
// src/, public/, configuration, and repository metadata are never touched.
const root = fileURLToPath(new URL("..", import.meta.url));
const dist = path.join(root, "dist");
const html = await readFile(path.join(dist, "index.html"), "utf8");
if (!html.includes('type="module"') || !html.includes("/assets/")) {
  throw new Error("Build the Vite production bundle before staging Pages.");
}
for (const generated of [
  "assets",
  "fonts",
  "images",
  "forge-field.webp",
  "forged-longsword.webp",
]) {
  await rm(path.join(root, generated), { recursive: true, force: true });
}
for (const name of await readdir(dist)) {
  await cp(path.join(dist, name), path.join(root, name), { recursive: true });
}
console.log(
  "Staged the production build at the repository root for GitHub Pages.",
);

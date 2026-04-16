/**
 * After `next build` with `output: "standalone"`, copy traced server + static assets
 * into `src-tauri/server_bundle` for Tauri to bundle as a resource.
 *
 * NOTE: On some Windows hosts, fs.cpSync on large trees may crash Node with 0xC0000409.
 * This script uses staged copy into a temp dir to avoid in-place deep-copy issues.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const outDir = path.join(root, "src-tauri", "server_bundle");
const tempDir = path.join(root, "src-tauri", ".server_bundle_tmp");
const tauriDist = path.join(root, ".tauri-dist");

function mustExist(p) {
  if (!fs.existsSync(p)) {
    console.error(`Missing: ${p}`);
    process.exit(1);
  }
}

function copyTree(src, dest) {
  mustExist(src);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

mustExist(path.join(standalone, "server.js"));

fs.rmSync(tempDir, { recursive: true, force: true });
copyTree(standalone, tempDir);

// Next standalone needs these adjacent paths.
copyTree(path.join(root, ".next", "static"), path.join(tempDir, ".next", "static"));
copyTree(path.join(root, "public"), path.join(tempDir, "public"));
copyTree(path.join(root, "prisma"), path.join(tempDir, "prisma"));

// Do not ship .env in desktop bundle.
const dotEnv = path.join(tempDir, ".env");
if (fs.existsSync(dotEnv)) fs.rmSync(dotEnv, { force: true });

// Optional: include seeded sqlite if present.
const devDb = path.join(root, "prisma", "dev.db");
if (fs.existsSync(devDb)) {
  fs.copyFileSync(devDb, path.join(tempDir, "prisma", "dev.db"));
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.renameSync(tempDir, outDir);

// Minimal placeholder so `frontendDist` is valid for `cargo tauri build`.
fs.mkdirSync(tauriDist, { recursive: true });
fs.writeFileSync(
  path.join(tauriDist, "index.html"),
  "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"/><title>Komodo Hub</title></head><body><p>Desktop shell loads the local Next server.</p></body></html>\n",
  "utf8",
);

console.log(`Wrote ${path.relative(root, outDir)} and ${path.relative(root, tauriDist)}/index.html`);

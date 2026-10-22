import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
const source = join(publicDir, "logo.png");
if (!existsSync(source)) {
  throw new Error("Place the Deep Jyoti logo at public/logo.png");
}

mkdirSync(iconsDir, { recursive: true });

const white = { r: 255, g: 255, b: 255, alpha: 1 };

async function writeIcon(size, filePath, paddingRatio) {
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const logo = await sharp(source)
    .flatten({ background: "#ffffff" })
    .resize(inner, inner, { fit: "contain", background: white })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: white,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(filePath);
}

await writeIcon(192, join(iconsDir, "icon-192.png"), 0.08);
await writeIcon(512, join(iconsDir, "icon-512.png"), 0.08);
await writeIcon(180, join(iconsDir, "apple-touch-icon.png"), 0.08);

console.log("Wrote public/logo.png and PWA icons from", source);

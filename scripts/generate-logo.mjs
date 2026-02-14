import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
mkdirSync(publicDir, { recursive: true });

// Ocean Slate palette
const ACCENT  = '#5a7a8a';
const BG_LIGHT = '#f2f4f6';
const BG_DARK  = '#1e2830';

function logoSvg(size, dark = false) {
  const bg     = dark ? BG_DARK  : BG_LIGHT;
  const fg     = dark ? '#c4ccd4' : ACCENT;
  const radius = Math.round(size * 0.22);
  const font   = Math.round(size * 0.42);
  const brace  = Math.round(size * 0.28);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  <text
    x="50%" y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="'Courier New', Courier, monospace"
    font-weight="bold"
    font-size="${font}px"
    fill="${fg}"
  >{H}</text>
</svg>`;
}

// Standalone logo — light bg, multiple sizes
const sizes = [
  { name: 'logo-512.png',    size: 512, dark: false },
  { name: 'logo-256.png',    size: 256, dark: false },
  { name: 'logo-128.png',    size: 128, dark: false },
  { name: 'favicon-64.png',  size: 64,  dark: true  },
  { name: 'favicon-32.png',  size: 32,  dark: true  },
];

for (const { name, size, dark } of sizes) {
  const svg = Buffer.from(logoSvg(size, dark));
  const out = join(publicDir, name);
  await sharp(svg).png().toFile(out);
  console.log(`✓  ${name}  (${size}×${size})`);
}

console.log('\nDone. Files written to public/');

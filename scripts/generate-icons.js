/**
 * PWA asset generator (Module 10).
 *
 * Generates every icon size referenced by public/manifest.json, the app
 * shortcut icons, and placeholder screenshots — all rasterized from crisp SVG
 * sources via sharp, so they are sharp at any size and need no external art.
 *
 * Run:  npm run generate-icons
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PRIMARY = '#4f46e5';
const PRIMARY_DARK = '#4338ca';

const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');
const screenshotsDir = path.join(publicDir, 'screenshots');

for (const dir of [iconsDir, screenshotsDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Main app icon. Content kept within the central ~70% "safe zone" so it survives
// maskable cropping on Android.
const appIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${PRIMARY_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <!-- pantry jar / box motif -->
  <rect x="156" y="150" width="200" height="220" rx="28" fill="white" opacity="0.95"/>
  <rect x="186" y="120" width="140" height="46" rx="20" fill="white" opacity="0.95"/>
  <text x="256" y="300" font-family="Arial, sans-serif" font-size="150" font-weight="700"
        fill="${PRIMARY}" text-anchor="middle" dominant-baseline="middle">P+</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// App shortcut icons (96x96) — simple white glyphs on the brand color.
const shortcutIcons = {
  'shortcut-add': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="20" fill="${PRIMARY}"/>
      <rect x="42" y="24" width="12" height="48" rx="6" fill="white"/>
      <rect x="24" y="42" width="48" height="12" rx="6" fill="white"/>
    </svg>`,
  'shortcut-shopping': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="20" fill="${PRIMARY}"/>
      <path d="M26 30 h8 l6 30 h26 l6 -22 h-34" fill="none" stroke="white" stroke-width="6"
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="44" cy="68" r="5" fill="white"/>
      <circle cx="64" cy="68" r="5" fill="white"/>
    </svg>`,
  'shortcut-scan': `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="20" fill="${PRIMARY}"/>
      <g fill="white">
        <rect x="28" y="30" width="5" height="36"/>
        <rect x="38" y="30" width="3" height="36"/>
        <rect x="45" y="30" width="6" height="36"/>
        <rect x="55" y="30" width="3" height="36"/>
        <rect x="61" y="30" width="7" height="36"/>
      </g>
    </svg>`,
};

// Lightweight branded screenshots referenced by the manifest.
function screenshotSvg(w, h, label) {
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PRIMARY}"/>
        <stop offset="100%" stop-color="${PRIMARY_DARK}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="${w / 2}" y="${h / 2 - 20}" font-family="Arial, sans-serif" font-size="${Math.round(w / 12)}"
          font-weight="700" fill="white" text-anchor="middle">Pantry+</text>
    <text x="${w / 2}" y="${h / 2 + 30}" font-family="Arial, sans-serif" font-size="${Math.round(w / 28)}"
          fill="white" opacity="0.85" text-anchor="middle">${label}</text>
  </svg>`;
}

const screenshots = [
  { name: 'dashboard-mobile', w: 540, h: 720, label: 'Dashboard and inventory stats' },
  { name: 'inventory-mobile', w: 540, h: 720, label: 'Inventory with expiry tracking' },
  { name: 'dashboard-desktop', w: 1280, h: 720, label: 'Analytics dashboard' },
];

async function generate() {
  console.log('🎨 Generating PWA assets...\n');

  const baseBuffer = Buffer.from(appIconSvg);

  for (const size of sizes) {
    const out = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(baseBuffer).resize(size, size).png().toFile(out);
    console.log(`✅ icon-${size}x${size}.png`);
  }

  for (const [name, svg] of Object.entries(shortcutIcons)) {
    const out = path.join(iconsDir, `${name}.png`);
    await sharp(Buffer.from(svg)).resize(96, 96).png().toFile(out);
    console.log(`✅ ${name}.png`);
  }

  for (const s of screenshots) {
    const out = path.join(screenshotsDir, `${s.name}.png`);
    await sharp(Buffer.from(screenshotSvg(s.w, s.h, s.label))).png().toFile(out);
    console.log(`✅ screenshots/${s.name}.png`);
  }

  // Keep favicon-friendly base in sync.
  await sharp(baseBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-base.png'));

  console.log('\n✨ Done. All manifest assets generated.');
}

generate().catch((err) => {
  console.error('❌ Icon generation failed:', err);
  process.exit(1);
});

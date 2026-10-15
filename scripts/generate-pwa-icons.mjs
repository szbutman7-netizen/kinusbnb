import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + 16 * count;
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Planes
    entry.writeUInt16LE(32, 6); // 32 bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += item.buffer.length;
  }
  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function generateIcons() {
  const rootDir = process.cwd();
  const iconsDir = path.join(rootDir, 'public', 'icons');
  const appDir = path.join(rootDir, 'src', 'app');
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Ensure kinus-emblem.svg has navy circle background for perfect contrast across light & dark tabs
  let svgContent = fs.readFileSync(path.join(publicDir, 'assets', 'kinus-emblem.svg'), 'utf-8');
  if (svgContent.includes('fill="#00000000"')) {
    svgContent = svgContent.replace('fill="#00000000"', 'fill="#0B1A30"');
    fs.writeFileSync(path.join(publicDir, 'assets', 'kinus-emblem.svg'), svgContent, 'utf-8');
    console.log('Updated kinus-emblem.svg with #0B1A30 backdrop');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. Generate PWA and Web Icons
  const pwaConfigs = [
    { name: 'icon-512x512.png', size: 512, iconScale: 0.72, round: false },
    { name: 'icon-maskable-512x512.png', size: 512, iconScale: 0.60, round: false },
    { name: 'icon-192x192.png', size: 192, iconScale: 0.72, round: false },
    { name: 'apple-touch-icon.png', size: 180, iconScale: 0.72, round: false },
  ];

  for (const config of pwaConfigs) {
    const iconPixel = Math.round(config.size * config.iconScale);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${config.size}px;
              height: ${config.size}px;
              background-color: #0B1A30;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .icon-wrapper {
              width: ${iconPixel}px;
              height: ${iconPixel}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="icon-wrapper">
            ${svgContent}
          </div>
        </body>
      </html>
    `;

    await page.setViewportSize({ width: config.size, height: config.size });
    await page.setContent(html);
    const outPath = path.join(iconsDir, config.name);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: config.size, height: config.size }
    });
    console.log(`Generated ${config.name}`);
  }

  // 2. Generate browser tab circular favicons (16x16, 32x32, 48x48) with transparent corners
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = [];

  for (const size of icoSizes) {
    // Render at 4x scale for crisp anti-aliasing, then downsample or render with deviceScaleFactor
    const renderScale = 4;
    const renderDim = size * renderScale;
    const emblemDim = Math.round(renderDim * 0.88);

    const faviconHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${size}px;
              height: ${size}px;
              background: transparent;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .circle-badge {
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background-color: #0B1A30;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .emblem {
              width: ${Math.round(size * 0.88)}px;
              height: ${Math.round(size * 0.88)}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="circle-badge">
            <div class="emblem">
              ${svgContent}
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setViewportSize({ width: size, height: size });
    await page.setContent(faviconHtml);
    const buf = await page.screenshot({
      omitBackground: true,
      clip: { x: 0, y: 0, width: size, height: size }
    });
    icoPngBuffers.push({ width: size, height: size, buffer: buf });
  }

  // 3. Create multi-resolution favicon.ico
  const icoBuffer = createIco(icoPngBuffers);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(`Generated src/app/favicon.ico and public/favicon.ico (${icoBuffer.length} bytes, 16/32/48px)`);

  // 4. Sync Next.js App Router root icons
  fs.copyFileSync(path.join(iconsDir, 'icon-192x192.png'), path.join(appDir, 'icon.png'));
  fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), path.join(appDir, 'apple-icon.png'));
  console.log('Synced src/app/icon.png and src/app/apple-icon.png');

  await browser.close();
  console.log('All icons successfully generated!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});

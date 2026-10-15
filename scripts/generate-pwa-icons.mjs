import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgContent = fs.readFileSync(path.join(process.cwd(), 'public', 'assets', 'kinus-emblem.svg'), 'utf-8');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const configs = [
    { name: 'icon-192x192.png', size: 192, iconScale: 0.72 },
    { name: 'icon-512x512.png', size: 512, iconScale: 0.72 },
    { name: 'icon-maskable-512x512.png', size: 512, iconScale: 0.60 },
    { name: 'apple-touch-icon.png', size: 180, iconScale: 0.72 }
  ];

  for (const config of configs) {
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
    await page.screenshot({
      path: path.join(iconsDir, config.name),
      clip: { x: 0, y: 0, width: config.size, height: config.size }
    });
    console.log(`Generated ${config.name}`);
  }

  await browser.close();
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});

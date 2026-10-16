import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function generateOgImages() {
  const publicDir = path.join(process.cwd(), 'public');
  const appDir = path.join(process.cwd(), 'src', 'app');
  const emblemSvg = fs.readFileSync(path.join(publicDir, 'assets', 'kinus-emblem.svg'), 'utf-8');
  const heroBanquetBase64 = fs.readFileSync(path.join(publicDir, 'assets', 'hero-banquet.jpg')).toString('base64');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1. 1200x630 Landscape Open Graph Banner
  await page.setViewportSize({ width: 1200, height: 630 });

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px;
            height: 630px;
            background-color: #0B1A30;
            font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          /* Background image */
          .bg-photo {
            position: absolute;
            inset: 0;
            background-image: url('data:image/jpeg;base64,${heroBanquetBase64}');
            background-size: cover;
            background-position: center 30%;
            opacity: 0.28;
            filter: blur(1px);
          }
          /* Gradient overlay */
          .gradient-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 45%, rgba(15, 35, 66, 0.75) 0%, rgba(11, 26, 48, 0.95) 75%, #0B1A30 100%);
          }
          /* Subtle ambient gold radial */
          .gold-ambient {
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 300px;
            background: radial-gradient(circle, rgba(232, 216, 168, 0.18) 0%, rgba(232, 216, 168, 0) 70%);
            filter: blur(40px);
          }
          /* Border frame */
          .frame {
            position: absolute;
            inset: 20px;
            border: 1px solid rgba(232, 216, 168, 0.25);
            border-radius: 16px;
            pointer-events: none;
          }
          .corner-accent {
            position: absolute;
            width: 24px;
            height: 24px;
            border: 2px solid #E8D8A8;
          }
          .corner-tl { top: 20px; left: 20px; border-right: none; border-bottom: none; border-top-left-radius: 16px; }
          .corner-tr { top: 20px; right: 20px; border-left: none; border-bottom: none; border-top-right-radius: 16px; }
          .corner-bl { bottom: 20px; left: 20px; border-right: none; border-top: none; border-bottom-left-radius: 16px; }
          .corner-br { bottom: 20px; right: 20px; border-left: none; border-top: none; border-bottom-right-radius: 16px; }

          .content {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 40px;
            max-width: 1050px;
          }

          .emblem-wrapper {
            width: 130px;
            height: 130px;
            margin-bottom: 24px;
            border-radius: 50%;
            background: rgba(11, 26, 48, 0.85);
            border: 1.5px solid rgba(232, 216, 168, 0.4);
            box-shadow: 0 0 45px rgba(232, 216, 168, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
          }
          .emblem-wrapper svg {
            width: 100%;
            height: 100%;
          }

          .badge {
            background: rgba(232, 216, 168, 0.12);
            border: 1px solid rgba(232, 216, 168, 0.35);
            color: #E8D8A8;
            padding: 6px 28px;
            border-radius: 9999px;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 0.12em;
            margin-bottom: 16px;
          }

          .title {
            font-size: 56px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.02em;
            line-height: 1.15;
            margin-bottom: 12px;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          }

          .subtitle {
            font-size: 26px;
            font-weight: 600;
            color: #E8D8A8;
            margin-bottom: 14px;
            line-height: 1.3;
          }

          .en-subtitle {
            font-size: 18px;
            font-weight: 500;
            color: #94A3B8;
            letter-spacing: 0.05em;
          }
        </style>
      </head>
      <body>
        <div class="bg-photo"></div>
        <div class="gradient-overlay"></div>
        <div class="gold-ambient"></div>
        <div class="frame"></div>
        <div class="corner-accent corner-tl"></div>
        <div class="corner-accent corner-tr"></div>
        <div class="corner-accent corner-bl"></div>
        <div class="corner-accent corner-br"></div>

        <div class="content">
          <div class="emblem-wrapper">
            ${emblemSvg}
          </div>
          <div class="badge">
            תשפ״ז
          </div>
          <h1 class="title">כינוס השלוחים העולמי</h1>
          <p class="subtitle">מערך אירוח ולינה לשלוחים בימי הכינוס</p>
          <p class="en-subtitle">International Conference of Shluchim • Hospitality &amp; Housing</p>
        </div>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Save as high-quality JPEG (< 200KB for WhatsApp compatibility)
  const ogJpgPath = path.join(publicDir, 'og-image.jpg');
  await page.screenshot({
    path: ogJpgPath,
    type: 'jpeg',
    quality: 85,
  });
  console.log(`Generated ${ogJpgPath} (${fs.statSync(ogJpgPath).size} bytes)`);

  // Save as PNG for public and src/app/opengraph-image.png
  const ogPngPath = path.join(publicDir, 'og-image.png');
  await page.screenshot({
    path: ogPngPath,
    type: 'png',
  });
  console.log(`Generated ${ogPngPath} (${fs.statSync(ogPngPath).size} bytes)`);

  const appOgPngPath = path.join(appDir, 'opengraph-image.png');
  fs.copyFileSync(ogPngPath, appOgPngPath);
  console.log(`Copied to ${appOgPngPath}`);

  const twitterImgPath = path.join(appDir, 'twitter-image.png');
  fs.copyFileSync(ogPngPath, twitterImgPath);
  console.log(`Copied to ${twitterImgPath}`);

  // 2. Also generate square 600x600 WhatsApp preview image
  await page.setViewportSize({ width: 600, height: 600 });
  const squareHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 600px;
            height: 600px;
            background-color: #0B1A30;
            font-family: 'Assistant', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          }
          .bg-photo {
            position: absolute;
            inset: 0;
            background-image: url('data:image/jpeg;base64,${heroBanquetBase64}');
            background-size: cover;
            background-position: center;
            opacity: 0.25;
            filter: blur(1px);
          }
          .gradient-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 45%, rgba(15, 35, 66, 0.75) 0%, rgba(11, 26, 48, 0.95) 75%, #0B1A30 100%);
          }
          .frame {
            position: absolute;
            inset: 16px;
            border: 1px solid rgba(232, 216, 168, 0.25);
            border-radius: 14px;
          }
          .content {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 24px;
          }
          .emblem-wrapper {
            width: 140px;
            height: 140px;
            margin-bottom: 20px;
            border-radius: 50%;
            background: rgba(11, 26, 48, 0.85);
            border: 2px solid rgba(232, 216, 168, 0.45);
            box-shadow: 0 0 45px rgba(232, 216, 168, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .emblem-wrapper svg { width: 100%; height: 100%; }
          .badge {
            background: rgba(232, 216, 168, 0.12);
            border: 1px solid rgba(232, 216, 168, 0.35);
            color: #E8D8A8;
            padding: 5px 22px;
            border-radius: 9999px;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.1em;
            margin-bottom: 12px;
          }
          .title {
            font-size: 34px;
            font-weight: 800;
            color: #FFFFFF;
            line-height: 1.2;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 17px;
            font-weight: 600;
            color: #E8D8A8;
          }
        </style>
      </head>
      <body>
        <div class="bg-photo"></div>
        <div class="gradient-overlay"></div>
        <div class="frame"></div>
        <div class="content">
          <div class="emblem-wrapper">
            ${emblemSvg}
          </div>
          <div class="badge">
            תשפ״ז
          </div>
          <h1 class="title">כינוס השלוחים העולמי</h1>
          <p class="subtitle">מערך אירוח ולינה לשלוחים בימי הכינוס</p>
        </div>
      </body>
    </html>
  `;
  await page.setContent(squareHtml, { waitUntil: 'networkidle' });
  const squareJpgPath = path.join(publicDir, 'og-square.jpg');
  await page.screenshot({
    path: squareJpgPath,
    type: 'jpeg',
    quality: 85,
  });
  console.log(`Generated ${squareJpgPath} (${fs.statSync(squareJpgPath).size} bytes)`);

  await browser.close();
}

generateOgImages().catch(err => {
  console.error(err);
  process.exit(1);
});

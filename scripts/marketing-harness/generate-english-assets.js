/**
 * DocCleaner v1.8.0 - English Marketing Assets Automated Generator
 * Generates:
 * 1. 5 English Chrome Web Store Screenshots (1280x800) in store-assets/en/
 * 2. English Marquee (1400x560) and Small Promo Tile (440x280) in store-assets/en/
 * 3. English 1080p MP4 Demo Video (16.0s, 30fps) in assets/demo/en/
 * 4. English Animated GIF (<8MB, 800px) in assets/demo/en/
 * 5. Syncs Vietnamese assets to store-assets/vi/ and assets/demo/vi/ for symmetry
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const STORE_ASSETS_DIR = path.join(ROOT_DIR, 'store-assets');
const STORE_ASSETS_EN_DIR = path.join(STORE_ASSETS_DIR, 'en');
const STORE_ASSETS_VI_DIR = path.join(STORE_ASSETS_DIR, 'vi');

const ASSETS_DEMO_DIR = path.join(ROOT_DIR, 'assets/demo');
const ASSETS_DEMO_EN_DIR = path.join(ASSETS_DEMO_DIR, 'en');
const ASSETS_DEMO_VI_DIR = path.join(ASSETS_DEMO_DIR, 'vi');

const HARNESS_DIR = path.join(ROOT_DIR, 'scripts/marketing-harness');
const TEMP_EN_DIR = path.join(HARNESS_DIR, 'temp_build_en');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';

// Ensure output directories exist
fs.mkdirSync(STORE_ASSETS_EN_DIR, { recursive: true });
fs.mkdirSync(STORE_ASSETS_VI_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DEMO_EN_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DEMO_VI_DIR, { recursive: true });
fs.mkdirSync(TEMP_EN_DIR, { recursive: true });

console.log('🚀 Starting Automated English Marketing Asset Generation...');

// =========================================================================
// 0. SYNC VIETNAMESE ASSETS TO vi/ SUBDIRECTORY
// =========================================================================

const VI_FILES = [
  'screenshot1_1280x800.png',
  'screenshot2_1280x800.png',
  'screenshot3_1280x800.png',
  'screenshot4_1280x800.png',
  'screenshot5_1280x800.png',
  'marquee_1400x560.png',
  'promo_small_440x280.png'
];

for (const file of VI_FILES) {
  const src = path.join(STORE_ASSETS_DIR, file);
  const dest = path.join(STORE_ASSETS_VI_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(path.join(ASSETS_DEMO_DIR, 'doccleaner_demo_1080p.mp4'))) {
  fs.copyFileSync(
    path.join(ASSETS_DEMO_DIR, 'doccleaner_demo_1080p.mp4'),
    path.join(ASSETS_DEMO_VI_DIR, 'doccleaner_demo_1080p.mp4')
  );
}
if (fs.existsSync(path.join(ASSETS_DEMO_DIR, 'doccleaner_demo.gif'))) {
  fs.copyFileSync(
    path.join(ASSETS_DEMO_DIR, 'doccleaner_demo.gif'),
    path.join(ASSETS_DEMO_VI_DIR, 'doccleaner_demo.gif')
  );
}

// =========================================================================
// 1. ENGLISH SCREENSHOT CONFIGS (1280x800)
// =========================================================================

const ENGLISH_SCREENSHOT_CONFIGS = [
  {
    filename: 'screenshot1_1280x800.png',
    pill: '1-CLICK CLEAN VIEW',
    headline: 'Unblur Content & Remove Paywalls',
    subline: 'Instantly strip banner ads, upgrade paywalls, and blurred overlays for focused studying.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'https://www.studocu.com/en/document/macroeconomics-exam-prep-2025/102948',
    contentHtml: `
      <div style="display: flex; gap: 16px; height: 100%;">
        <!-- Before side -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 20px; position: relative; overflow: hidden; display: flex; flex-direction: column;">
          <div style="display: inline-block; background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42; margin-bottom: 12px; align-self: flex-start;">BEFORE (BLURRED PAYWALL)</div>
          <h3 style="font-size: 16px; font-weight: 900; color: #091b42; margin-bottom: 8px;">1. FUNDAMENTALS OF MACROECONOMICS</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #333; margin-bottom: 12px;">Macroeconomics studies the behavior and performance of an economy as a whole, focusing on aggregate changes in economic growth, inflation, and unemployment.</p>
          <div style="flex: 1; filter: blur(5px); opacity: 0.6; line-height: 1.8; font-size: 13px; color: #444;">
            <p>The aggregate demand curve represents the total quantity of all goods and services demanded across all levels of the economy at varying price levels.</p>
            <p>Fiscal policy instruments such as government taxation and expenditure dynamically shift economic equilibrium during cyclical recessions.</p>
          </div>
          <!-- Paywall Nag Box -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #091b42; color: #ffffff; border: 2px solid #c6eb34; border-radius: 8px; padding: 16px 20px; text-align: center; width: 80%; box-sizing: border-box;">
            <div style="font-size: 13px; font-weight: 900; color: #c6eb34; margin-bottom: 4px;">DOCUMENT RESTRICTED</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 10px;">Upgrade to Premium to view all 25 pages of this document</div>
            <div style="display: inline-block; background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 6px 14px; border-radius: 9999px;">Upgrade Now</div>
          </div>
        </div>

        <!-- After side -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 20px; position: relative; display: flex; flex-direction: column;">
          <div style="display: inline-block; background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42; margin-bottom: 12px; align-self: flex-start;">AFTER (100% CLEAN & CRISP)</div>
          <h3 style="font-size: 16px; font-weight: 900; color: #091b42; margin-bottom: 8px;">1. FUNDAMENTALS OF MACROECONOMICS</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #091b42; margin-bottom: 12px;">Macroeconomics studies the behavior and performance of an economy as a whole, focusing on aggregate changes in economic growth, inflation, and unemployment.</p>
          <div style="flex: 1; line-height: 1.8; font-size: 13px; color: #091b42;">
            <p style="margin-bottom: 10px;"><strong>Aggregate Demand:</strong> The aggregate demand curve represents the total quantity of all goods and services demanded across all economic sectors at varying price levels.</p>
            <p style="margin-bottom: 10px;"><strong>Fiscal Policy:</strong> Counter-cyclical taxation and public expenditure stabilize economic fluctuations, closing inflationary and recessionary GDP gaps.</p>
            <p><strong>Monetary Equilibrium:</strong> Central bank open-market operations determine liquidity and reserve ratios to target long-term price stability.</p>
          </div>
          <!-- FAB indicator -->
          <div style="position: absolute; bottom: 16px; right: 16px; width: 44px; height: 44px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot2_1280x800.png',
    pill: 'STANDARDIZED A4 ENGINE',
    headline: 'Standardized A4 Print Layout',
    subline: 'Pre-renders canvases to exact A4 printing dimensions (794px × 1123px) — zero blank pages.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'https://www.studocu.com/en/document/macroeconomics-study-guide-a4/204918',
    contentHtml: `
      <div style="display: flex; gap: 20px; height: 100%; align-items: center; justify-content: center;">
        <!-- Clean A4 Sheet -->
        <div style="width: 440px; height: 100%; background: #ffffff; border: 1.5px solid #091b42; border-radius: 4px; padding: 24px 28px; box-sizing: border-box; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #091b42; padding-bottom: 8px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: 800; color: #5e6d8a;">OXFORD UNIVERSITY ECONOMICS</span>
            <span style="font-size: 11px; font-weight: 800; color: #5e6d8a;">PAGE 01 / 12</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 900; color: #091b42; text-align: center; margin-bottom: 4px;">MACROECONOMICS EXAM SYLLABUS</h2>
          <div style="font-size: 11px; text-align: center; color: #5e6d8a; margin-bottom: 16px;">Standardized A4 Format by DocCleaner v1.8.0</div>
          <div style="font-size: 12px; line-height: 1.7; color: #091b42; flex: 1;">
            <p style="margin-bottom: 8px;"><strong>Question 1:</strong> Analyze shifts in the IS-LM framework following an expansionary monetary policy shock under fixed exchange rates.</p>
            <p style="margin-bottom: 8px;"><strong>Question 2:</strong> Detail the Solow-Swan neoclassical growth model and calculate steady-state capital accumulation per effective worker.</p>
            <p><strong>Question 3:</strong> Compute consumer surplus (CS) and deadweight loss (DWL) under monopolistic supply restrictions.</p>
          </div>
          <div style="border-top: 1px dashed #5e6d8a; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #5e6d8a;">
            <span>DocCleaner A4 Print Engine</span>
            <span>Standard Sheet: 210mm × 297mm</span>
          </div>
        </div>

        <!-- Print Feature Callout Box -->
        <div style="width: 320px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #193582; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: #c6eb34; color: #091b42; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">AUTOMATIC</span>
              <span style="font-size: 14px; font-weight: 900;">A4 Canvas Optimization</span>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #f6f7ef; opacity: 0.95;">Optimizes canvas layers and applies smart page breaks, completely preventing alternating blank pages during print spooling.</p>
          </div>

          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 14px; font-weight: 900; margin-bottom: 6px;">DocCleaner Print Tip</div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">In Chrome's print dialog, set <strong>Margins: None</strong> and enable <strong>Background graphics</strong> for crisp study notes.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot3_1280x800.png',
    pill: 'DUAL PLATFORM SUPPORT',
    headline: 'Full Support for Studocu & Scribd',
    subline: 'Runs seamlessly on the two largest academic study platforms worldwide with 100% feature parity.',
    platform: 'scribd',
    badge: 'SC',
    badgeColor: '#58c474',
    url: 'https://www.scribd.com/doc/48192841/English-Everyday-Study-Guide',
    contentHtml: `
      <div style="display: flex; gap: 18px; height: 100%;">
        <!-- Studocu Card -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 6px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 13px;">ST</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #091b42;">Studocu Global & Local</div>
                <div style="font-size: 10.5px; color: #5e6d8a;">studocu.com & studocu.vn</div>
              </div>
            </div>
            <span style="background: #f6f7ef; border: 1px solid #091b42; color: #091b42; font-size: 10px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">100% FREE</span>
          </div>
          <div style="flex: 1; background: #f6f7ef; border: 1px solid #5e6d8a; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #091b42;">
            <div style="font-weight: 900; margin-bottom: 6px; color: #193582;">Dedicated Studocu Features:</div>
            <ul style="padding-left: 16px; margin: 0;">
              <li>Completely strips blurred paywalls and nag dialogs</li>
              <li>Preloads 100% of document pages in high fidelity</li>
              <li>High-visibility lime action button (#c6eb34)</li>
            </ul>
          </div>
        </div>

        <!-- Scribd Card -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; background: #58c474; border: 1.5px solid #091b42; border-radius: 6px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #091b42;">SC</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #091b42;">Scribd Documents</div>
                <div style="font-size: 10.5px; color: #5e6d8a;">scribd.com/document</div>
              </div>
            </div>
            <span style="background: #f6f7ef; border: 1px solid #091b42; color: #091b42; font-size: 10px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">100% FREE</span>
          </div>
          <div style="flex: 1; background: #f6f7ef; border: 1px solid #5e6d8a; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #091b42;">
            <div style="font-weight: 900; margin-bottom: 6px; color: #193582;">Dedicated Scribd Features:</div>
            <ul style="padding-left: 16px; margin: 0;">
              <li>Removes 30-day trial nag bar and bottom promotional footers</li>
              <li>High-resolution A4 document layout extractor</li>
              <li>Distinctive emerald action button (#58c474)</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot4_1280x800.png',
    pill: 'SMART STUDY SHELF',
    headline: 'Auto Study Shelf & Star Favorites',
    subline: 'Auto-saves reading history, stars favorite docs with eviction immunity, and cleans up with 1 click.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'chrome-extension://doccleaner/popup.html#shelf',
    contentHtml: `
      <div style="display: flex; gap: 24px; height: 100%; align-items: center; justify-content: center;">
        <!-- Embedded 320px Popup Mockup -->
        <div style="width: 320px; background: #193582; border: 1.5px solid #091b42; border-radius: 16px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;">
          <!-- Popup Header -->
          <div style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 12px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; font-weight: 900; color: #091b42;">DocCleaner</span>
            <div style="border: 1px solid #091b42; border-radius: 9999px; padding: 2px 6px; font-size: 10px; font-weight: 800; background: #ffffff;">
              <span style="background: #091b42; color: #c6eb34; padding: 1px 4px; border-radius: 3px;">EN</span> VN ES FR
            </div>
            <span style="background: #c6eb34; border: 1px solid #091b42; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 6px;">v1.8.0</span>
          </div>

          <!-- Segmented Tab -->
          <div style="display: flex; gap: 4px; background: #091b42; padding: 3px; border-radius: 8px;">
            <div style="flex: 1; text-align: center; font-size: 11px; font-weight: 800; color: #5e6d8a; padding: 4px 0;">Actions</div>
            <div style="flex: 1; text-align: center; font-size: 11px; font-weight: 800; background: #f6f7ef; color: #091b42; padding: 4px 0; border-radius: 6px;">Study Shelf (3)</div>
          </div>

          <!-- Shelf Cards -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 8px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 28px; height: 28px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 4px; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center;">ST</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; font-weight: 800; color: #091b42; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Macroeconomics - Exam 2025</div>
                <div style="font-size: 9.5px; color: #5e6d8a;">12 pages · 2 hours ago</div>
              </div>
              <span style="background: #ffdd00; border: 1.5px solid #091b42; border-radius: 4px; padding: 3px 5px; font-size: 10px;">★</span>
              <span style="background: #fee2e2; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 3px 5px; font-size: 10px;">✕</span>
            </div>

            <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 8px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 28px; height: 28px; background: #58c474; border: 1.5px solid #091b42; border-radius: 4px; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; color: #091b42;">SC</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; font-weight: 800; color: #091b42; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">English Everyday Activities B</div>
                <div style="font-size: 9.5px; color: #5e6d8a;">126 pages · 1 day ago</div>
              </div>
              <span style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 4px; padding: 3px 5px; font-size: 10px;">☆</span>
              <span style="background: #fee2e2; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 3px 5px; font-size: 10px;">✕</span>
            </div>
          </div>

          <!-- Inline Clear Confirmation Bar -->
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10.5px; font-weight: 800; color: #091b42;">Clear all docs?</span>
            <div style="display: flex; gap: 4px;">
              <span style="background: #ef4444; color: #fff; font-size: 9.5px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42;">Clear</span>
              <span style="background: #f6f7ef; color: #091b42; font-size: 9.5px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42;">Cancel</span>
            </div>
          </div>
        </div>

        <!-- Shelf Feature Descriptions -->
        <div style="width: 440px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 15px; font-weight: 900; margin-bottom: 6px;">Auto-Saves Reading History</div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">Seamlessly captures titles, page counts, and canonical URLs into local storage up to 25 documents with zero cloud sync.</p>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 15px; font-weight: 900; margin-bottom: 6px;">Star Immunity (LRU Engine)</div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">Starred favorite documents are immune to eviction, ensuring essential exam revision materials remain readily accessible.</p>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 15px; font-weight: 900; margin-bottom: 6px;">1-Click Shelf Management</div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">Single-item removal and whole-shelf clearing with in-popup confirmation bar — no disruptive popups.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot5_1280x800.png',
    pill: 'PRIVACY & MULTILINGUAL',
    headline: 'Multilingual & Campus Lab PC Privacy',
    subline: '1-tap switch across English, Vietnamese, Spanish, French. Zero cloud tracking, 100% local client execution.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'https://khanhnkq.github.io/DocCleaner/',
    contentHtml: `
      <div style="display: flex; flex-direction: column; gap: 20px; height: 100%; justify-content: center; align-items: center;">
        <!-- Language selector badges -->
        <div style="display: flex; gap: 16px;">
          <div style="background: #c6eb34; border: 2px solid #091b42; border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 130px;">
            <div style="font-size: 18px; font-weight: 900; color: #091b42;">ENGLISH</div>
            <div style="font-size: 11px; font-weight: 800; color: #193582;">Default International</div>
          </div>
          <div style="background: #ffffff; border: 2px solid #091b42; border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 130px;">
            <div style="font-size: 18px; font-weight: 900; color: #091b42;">TIẾNG VIỆT</div>
            <div style="font-size: 11px; font-weight: 800; color: #5e6d8a;">Bản địa hóa 100%</div>
          </div>
          <div style="background: #ffffff; border: 2px solid #091b42; border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 130px;">
            <div style="font-size: 18px; font-weight: 900; color: #091b42;">ESPAÑOL</div>
            <div style="font-size: 11px; font-weight: 800; color: #5e6d8a;">América Latina & ES</div>
          </div>
          <div style="background: #ffffff; border: 2px solid #091b42; border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 130px;">
            <div style="font-size: 18px; font-weight: 900; color: #091b42;">FRANÇAIS</div>
            <div style="font-size: 11px; font-weight: 800; color: #5e6d8a;">France & Canada</div>
          </div>
        </div>

        <!-- Privacy & Security Guarantee Box -->
        <div style="display: flex; gap: 20px; width: 100%; max-width: 860px;">
          <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="width: 32px; height: 32px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🛡️</span>
              <h3 style="font-size: 15px; font-weight: 900; color: #091b42;">Zero Data Collection</h3>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">DocCleaner collects zero browsing history, zero cookies, and zero personal credentials. It makes no remote server connections.</p>
          </div>

          <div style="flex: 1; background: #193582; border: 1.5px solid #091b42; border-radius: 12px; padding: 22px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="width: 32px; height: 32px; background: #ffffff; border: 1.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #091b42;">⚡</span>
              <h3 style="font-size: 15px; font-weight: 900;">Campus Lab PC Mode</h3>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #f6f7ef; opacity: 0.95;">Designed for shared school computers. Automatically wipes temporary session caches the moment the browser window closes.</p>
          </div>
        </div>
      </div>
    `
  }
];

function generateScreenshotFullHtml(cfg) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 800px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 48px;
      overflow: hidden;
      position: relative;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .header-left {
      max-width: 900px;
    }
    .pill-badge {
      display: inline-block;
      background: #c6eb34;
      color: #091b42;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1.5px solid #091b42;
      margin-bottom: 8px;
    }
    .headline {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 4px;
      letter-spacing: -0.4px;
    }
    .subline {
      font-size: 14px;
      color: #f6f7ef;
      opacity: 0.92;
      line-height: 1.4;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #193582;
      border: 1.5px solid #091b42;
      padding: 6px 14px;
      border-radius: 8px;
    }
    .brand-title {
      font-size: 14px;
      font-weight: 900;
      color: #ffffff;
    }
    .brand-version {
      background: #c6eb34;
      color: #091b42;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .mockup-container {
      width: 100%;
      height: 520px;
      background: #f6f7ef;
      border: 1.5px solid #091b42;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .browser-titlebar {
      height: 38px;
      background: #ffffff;
      border-bottom: 1.5px solid #091b42;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 12px;
    }
    .traffic-lights {
      display: flex;
      gap: 6px;
    }
    .light {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid #091b42;
    }
    .light.red { background: #ff5f56; }
    .light.yellow { background: #ffbd2e; }
    .light.green { background: #27c93f; }
    .address-bar {
      flex: 1;
      max-width: 600px;
      height: 24px;
      background: #f6f7ef;
      border: 1px solid #091b42;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 600;
      color: #5e6d8a;
      gap: 6px;
    }
    .platform-monogram {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: ${cfg.badgeColor};
      border: 1px solid #091b42;
      font-size: 9px;
      font-weight: 900;
      color: #091b42;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mockup-body {
      flex: 1;
      padding: 16px;
      overflow: hidden;
      background: #f6f7ef;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      color: #5e6d8a;
      padding-top: 4px;
    }
    .feature-tags {
      display: flex;
      gap: 12px;
    }
    .feature-tag {
      background: #193582;
      color: #ffffff;
      border: 1.5px solid #091b42;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="header-left">
      <div class="pill-badge">${cfg.pill}</div>
      <h1 class="headline">${cfg.headline}</h1>
      <p class="subline">${cfg.subline}</p>
    </div>
    <div class="header-right">
      <span class="brand-title">DocCleaner</span>
      <span class="brand-version">v1.8.0</span>
    </div>
  </div>

  <div class="mockup-container">
    <div class="browser-titlebar">
      <div class="traffic-lights">
        <span class="light red"></span>
        <span class="light yellow"></span>
        <span class="light green"></span>
      </div>
      <div class="platform-monogram">${cfg.badge}</div>
      <div class="address-bar">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#5e6d8a" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>${cfg.url}</span>
      </div>
    </div>
    <div class="mockup-body">
      ${cfg.contentHtml}
    </div>
  </div>

  <div class="footer-bar">
    <span>DocCleaner · Better Studocu & Scribd Reader (Free)</span>
    <div class="feature-tags">
      <span class="feature-tag">100% Free Forever</span>
      <span class="feature-tag">Zero Tracking</span>
      <span class="feature-tag">Standardized A4 Print</span>
    </div>
  </div>
</body>
</html>`;
}

// Generate the 5 English screenshots
for (let i = 0; i < ENGLISH_SCREENSHOT_CONFIGS.length; i++) {
  const cfg = ENGLISH_SCREENSHOT_CONFIGS[i];
  console.log(`📸 Capturing English ${cfg.filename}...`);
  const htmlPath = path.join(TEMP_EN_DIR, `en_screen_${i + 1}.html`);
  const outPngPath = path.join(STORE_ASSETS_EN_DIR, cfg.filename);

  fs.writeFileSync(htmlPath, generateScreenshotFullHtml(cfg), 'utf8');

  cp.execFileSync(CHROME_BIN, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    '--window-size=1280,800',
    `--screenshot=${outPngPath}`,
    `file://${htmlPath}`
  ]);
}

// =========================================================================
// 2. ENGLISH MARQUEE & SMALL PROMO TILES
// =========================================================================

console.log('🎨 Generating English Marquee (1400x560) and Small Tile (440x280)...');

function generateEnglishMarqueeHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1400px;
      height: 560px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 50px 70px;
      overflow: hidden;
    }
    .left-hero { max-width: 720px; }
    .badge-pill {
      display: inline-block;
      background: #c6eb34;
      color: #091b42;
      font-size: 14px;
      font-weight: 900;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 2px solid #091b42;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 46px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 14px;
      letter-spacing: -1px;
    }
    p {
      font-size: 18px;
      line-height: 1.5;
      color: #f6f7ef;
      opacity: 0.95;
      margin-bottom: 24px;
    }
    .cta-tags { display: flex; gap: 12px; }
    .cta-tag {
      background: #193582;
      border: 1.5px solid #c6eb34;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 6px;
    }
    .right-preview {
      width: 480px;
      height: 380px;
      background: #f6f7ef;
      border: 2px solid #091b42;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="left-hero">
    <div class="badge-pill">BETTER STUDOCU & SCRIBD · 100% FREE</div>
    <h1>DocCleaner — Read & Print Study Papers Without Limits</h1>
    <p>Eliminate annoying banner clutter, unblur paywalled notes, and export flawless A4 PDFs for Studocu and Scribd.</p>
    <div class="cta-tags">
      <span class="cta-tag">Bypass Paywalls</span>
      <span class="cta-tag">Standardized A4 Print</span>
      <span class="cta-tag">Smart Study Shelf</span>
      <span class="cta-tag">4 Languages</span>
    </div>
  </div>
  <div class="right-preview">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #091b42; padding-bottom: 10px;">
      <span style="font-size: 16px; font-weight: 900; color: #091b42;">DocCleaner v1.8.0</span>
      <span style="background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 2px 8px; border-radius: 4px; border: 1px solid #091b42;">PRO READY</span>
    </div>
    <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
      <span style="width: 32px; height: 32px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 6px; font-size: 13px; font-weight: 900; color: #091b42; display: flex; align-items: center; justify-content: center;">ST</span>
      <div>
        <div style="font-size: 12px; font-weight: 900; color: #091b42;">Studocu Lecture Notes</div>
        <div style="font-size: 10px; color: #5e6d8a;">100% unblurred · Ready for A4 print</div>
      </div>
    </div>
    <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
      <span style="width: 32px; height: 32px; background: #58c474; border: 1.5px solid #091b42; border-radius: 6px; font-size: 13px; font-weight: 900; color: #091b42; display: flex; align-items: center; justify-content: center;">SC</span>
      <div>
        <div style="font-size: 12px; font-weight: 900; color: #091b42;">Scribd Study Guides</div>
        <div style="font-size: 10px; color: #5e6d8a;">Cleaned 30-day trials & bottom ads</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateEnglishPromoSmallHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 440px;
      height: 280px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px;
      overflow: hidden;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 900;
      color: #c6eb34;
    }
    .free-pill {
      background: #193582;
      color: #ffffff;
      border: 1px solid #c6eb34;
      font-size: 10px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .main-title {
      font-size: 22px;
      font-weight: 900;
      line-height: 1.25;
      margin: 10px 0;
      color: #ffffff;
    }
    .platform-chips {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .chip {
      background: #f6f7ef;
      color: #091b42;
      font-size: 10.5px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #091b42;
    }
    .footer-desc {
      font-size: 11px;
      color: #f6f7ef;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="logo-badge">
      <span style="background: #c6eb34; color: #091b42; width: 22px; height: 22px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900;">D</span>
      <span>DocCleaner</span>
    </div>
    <span class="free-pill">100% FREE</span>
  </div>
  <div>
    <div class="main-title">Better Studocu & Scribd Reader</div>
    <div class="platform-chips">
      <span class="chip">Unblur Pages</span>
      <span class="chip">Standard A4 Print</span>
      <span class="chip">No Ads</span>
    </div>
  </div>
  <div class="footer-desc">
    1-Click Clean Reading & Flawless A4 Study Notes
  </div>
</body>
</html>`;
}

const marqueeEnHtmlPath = path.join(TEMP_EN_DIR, 'marquee_en.html');
const promoSmallEnHtmlPath = path.join(TEMP_EN_DIR, 'promo_small_en.html');
fs.writeFileSync(marqueeEnHtmlPath, generateEnglishMarqueeHtml(), 'utf8');
fs.writeFileSync(promoSmallEnHtmlPath, generateEnglishPromoSmallHtml(), 'utf8');

cp.execFileSync(CHROME_BIN, [
  '--headless=new',
  '--hide-scrollbars',
  '--disable-gpu',
  '--force-device-scale-factor=1',
  '--window-size=1400,560',
  `--screenshot=${path.join(STORE_ASSETS_EN_DIR, 'marquee_1400x560.png')}`,
  `file://${marqueeEnHtmlPath}`
]);

cp.execFileSync(CHROME_BIN, [
  '--headless=new',
  '--hide-scrollbars',
  '--disable-gpu',
  '--force-device-scale-factor=1',
  '--window-size=440,280',
  `--screenshot=${path.join(STORE_ASSETS_EN_DIR, 'promo_small_440x280.png')}`,
  `file://${promoSmallEnHtmlPath}`
]);

// =========================================================================
// 3. GENERATE ENGLISH MOTION GRAPHIC DEMO VIDEO & GIF (1920x1080)
// =========================================================================

console.log('🎬 Rendering English Motion Graphic Video & GIF Frames...');

const ENGLISH_SCENE_TEMPLATES = [
  {
    name: 'en_scene1_blurred.html',
    title: 'Step 1: Cluttered Document & Blurred Paywall',
    desc: 'Students encounter intrusive upgrade banners, modal popups, and blurred document pages on Studocu & Scribd.',
    bodyHtml: `
      <div style="display: flex; gap: 30px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 800px; height: 600px; background: #ffffff; border: 2px solid #091b42; border-radius: 8px; padding: 40px; position: relative;">
          <div style="font-size: 24px; font-weight: 900; color: #091b42; margin-bottom: 20px;">MACROECONOMICS - EXAM SYLLABUS 2025</div>
          <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">Page 1 displays introductory concepts, core definitions, and market equilibrium assumptions.</p>
          <div style="filter: blur(6px); opacity: 0.5; font-size: 16px; line-height: 2;">
            The aggregate market demand function demonstrates consumer willingness to purchase at various price levels. When price escalates, demand contracts predictably. Demand elasticity dictates total firm revenues.
          </div>
          <div style="position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); background: #091b42; color: #ffffff; border: 3px solid #c6eb34; border-radius: 12px; padding: 30px 40px; text-align: center; width: 500px;">
            <div style="font-size: 20px; font-weight: 900; color: #c6eb34; margin-bottom: 8px;">DOCUMENT RESTRICTED</div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 16px;">Please upgrade to Premium to unlock the remaining 24 pages</div>
            <div style="background: #c6eb34; color: #091b42; font-size: 14px; font-weight: 900; padding: 10px 24px; border-radius: 9999px; display: inline-block;">Upgrade Now</div>
          </div>
          <!-- FAB on page -->
          <div style="position: absolute; bottom: 30px; right: 30px; width: 64px; height: 64px; background: #c6eb34; border: 2.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'en_scene2_unblurred.html',
    title: 'Step 2: Click the DocCleaner Floating Action Button (1 Click)',
    desc: 'Paywalls vanish immediately, pages preload completely, and the layout centers into clean A4 print format.',
    bodyHtml: `
      <div style="display: flex; gap: 30px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 800px; height: 600px; background: #ffffff; border: 2px solid #091b42; border-radius: 8px; padding: 40px; position: relative;">
          <div style="font-size: 24px; font-weight: 900; color: #091b42; margin-bottom: 20px;">MACROECONOMICS - EXAM SYLLABUS 2025</div>
          <div style="background: #f6f7ef; border-left: 4px solid #c6eb34; padding: 12px 18px; margin-bottom: 20px; font-size: 14px; font-weight: 800; color: #091b42;">
            Status: 100% Cleaned · Standardized A4 Print Layout Ready
          </div>
          <div style="font-size: 16px; line-height: 1.8; color: #091b42;">
            <p style="margin-bottom: 12px;"><strong>Law of Demand:</strong> Aggregate demand maps the total goods and services purchased at each price level, inversely proportional under ceteris paribus assumptions.</p>
            <p style="margin-bottom: 12px;"><strong>Price Elasticity:</strong> The price elasticity of demand governs optimal pricing strategies and monopoly markups across competitive markets.</p>
            <p><strong>Market Clearing:</strong> General equilibrium coordinates supply and demand vectors to maximize total deadweight-free economic surplus.</p>
          </div>
          <div style="position: absolute; bottom: 30px; right: 30px; width: 64px; height: 64px; background: #c6eb34; border: 2.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: scale(1.15);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'en_scene3_shelf.html',
    title: 'Step 3: Open Study Shelf & Star Favorites',
    desc: 'Reading history is automatically captured locally with star immunity and instant 1-click shelf management.',
    bodyHtml: `
      <div style="display: flex; gap: 40px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 420px; background: #193582; border: 2.5px solid #091b42; border-radius: 20px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #f6f7ef; border: 2px solid #091b42; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: 900; color: #091b42;">DocCleaner</span>
            <span style="background: #c6eb34; color: #091b42; font-size: 12px; font-weight: 900; padding: 3px 8px; border-radius: 6px; border: 1px solid #091b42;">v1.8.0 PRO</span>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 38px; height: 38px; background: #c6eb34; border: 2px solid #091b42; border-radius: 6px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center;">ST</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 900; color: #091b42;">Macroeconomics 2025</div>
              <div style="font-size: 11px; color: #5e6d8a;">Just opened · 24 pages</div>
            </div>
            <span style="background: #ffdd00; border: 1.5px solid #091b42; border-radius: 6px; padding: 4px 8px; font-size: 14px;">★</span>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 38px; height: 38px; background: #58c474; border: 2px solid #091b42; border-radius: 6px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; color: #091b42;">SC</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 900; color: #091b42;">English Everyday B</div>
              <div style="font-size: 11px; color: #5e6d8a;">1 day ago · 126 pages</div>
            </div>
            <span style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 6px; padding: 4px 8px; font-size: 14px;">☆</span>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'en_scene4_outro.html',
    title: 'Step 4: 100% Free · Zero Ads · Zero Tracking',
    desc: 'Install DocCleaner directly from Chrome Web Store and experience distraction-free reading today!',
    bodyHtml: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 24px;">
        <div style="background: #c6eb34; color: #091b42; font-size: 16px; font-weight: 900; padding: 8px 24px; border-radius: 9999px; border: 2px solid #091b42;">
          CHROME EXTENSION MANIFEST V3
        </div>
        <h2 style="font-size: 48px; font-weight: 900; color: #ffffff; letter-spacing: -1px;">DocCleaner — Better Studocu & Scribd Reader</h2>
        <p style="font-size: 20px; color: #f6f7ef; max-width: 800px; line-height: 1.5;">
          Free forever · Works on studocu.com, studocu.vn, and scribd.com · 100% client-side privacy.
        </p>
        <div style="display: flex; gap: 16px; margin-top: 10px;">
          <span style="background: #193582; color: #c6eb34; border: 2px solid #c6eb34; padding: 12px 28px; border-radius: 12px; font-size: 18px; font-weight: 900;">Add to Chrome (Free)</span>
          <span style="background: #ffffff; color: #091b42; border: 2px solid #091b42; padding: 12px 28px; border-radius: 12px; font-size: 18px; font-weight: 900;">github.com/khanhnkq/DocCleaner</span>
        </div>
      </div>
    `
  }
];

function generateSceneFullHtml(s) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      overflow: hidden;
    }
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scene-title {
      font-size: 38px;
      font-weight: 900;
      color: #c6eb34;
      margin-bottom: 8px;
    }
    .scene-desc {
      font-size: 20px;
      color: #f6f7ef;
      opacity: 0.9;
    }
    .scene-stage {
      flex: 1;
      margin: 30px 0;
      background: #193582;
      border: 3px solid #091b42;
      border-radius: 20px;
      padding: 30px;
      overflow: hidden;
    }
    .scene-footer {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 800;
      color: #5e6d8a;
    }
  </style>
</head>
<body>
  <div class="scene-header">
    <div>
      <div class="scene-title">${s.title}</div>
      <div class="scene-desc">${s.desc}</div>
    </div>
    <div style="background: #193582; border: 2px solid #c6eb34; padding: 10px 20px; border-radius: 9999px; font-size: 18px; font-weight: 900; color: #ffffff;">
      DocCleaner Demo
    </div>
  </div>
  <div class="scene-stage">
    ${s.bodyHtml}
  </div>
  <div class="scene-footer">
    <span>Better Studocu & Scribd Reader</span>
    <span>100% Free · Flat Graphic Poster Design</span>
  </div>
</body>
</html>`;
}

// Render the 4 key English scene PNGs
const EN_SCENE_PNGS = [];
for (let i = 0; i < ENGLISH_SCENE_TEMPLATES.length; i++) {
  const s = ENGLISH_SCENE_TEMPLATES[i];
  const htmlPath = path.join(TEMP_EN_DIR, s.name);
  const pngPath = path.join(TEMP_EN_DIR, `en_scene_${i + 1}.png`);
  fs.writeFileSync(htmlPath, generateSceneFullHtml(s), 'utf8');

  cp.execFileSync(CHROME_BIN, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    '--window-size=1920,1080',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ]);
  EN_SCENE_PNGS.push(pngPath);
}

// Generate English MP4
console.log('🎥 Encoding English doccleaner_demo_1080p.mp4 (16.0s, 30fps, silent)...');
const EN_MP4_OUT = path.join(ASSETS_DEMO_EN_DIR, 'doccleaner_demo_1080p.mp4');

const ffmpegFilter = `
  [0:v]format=yuv420p,scale=1920:1080,setsar=1[v0];
  [1:v]format=yuv420p,scale=1920:1080,setsar=1[v1];
  [2:v]format=yuv420p,scale=1920:1080,setsar=1[v2];
  [3:v]format=yuv420p,scale=1920:1080,setsar=1[v3];
  [v0][v1]xfade=transition=fade:duration=0.5:offset=4.0[x1];
  [x1][v2]xfade=transition=fade:duration=0.5:offset=8.0[x2];
  [x2][v3]xfade=transition=fade:duration=0.5:offset=12.0[x3]
`;

cp.execFileSync(FFMPEG_BIN, [
  '-y',
  '-loop', '1', '-t', '4.5', '-i', EN_SCENE_PNGS[0],
  '-loop', '1', '-t', '4.5', '-i', EN_SCENE_PNGS[1],
  '-loop', '1', '-t', '4.5', '-i', EN_SCENE_PNGS[2],
  '-loop', '1', '-t', '4.5', '-i', EN_SCENE_PNGS[3],
  '-filter_complex', ffmpegFilter.trim(),
  '-map', '[x3]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-t', '16.0',
  EN_MP4_OUT
]);

console.log('🎞️ Encoding English doccleaner_demo.gif (800x450, <8MB, infinite loop)...');
const EN_GIF_OUT = path.join(ASSETS_DEMO_EN_DIR, 'doccleaner_demo.gif');

cp.execFileSync(FFMPEG_BIN, [
  '-y',
  '-i', EN_MP4_OUT,
  '-vf', 'fps=15,scale=800:450:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
  '-loop', '0',
  EN_GIF_OUT
]);

console.log('✅ ALL ENGLISH MARKETING ASSETS SUCCESSFULLY GENERATED!');

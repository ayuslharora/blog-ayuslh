import puppeteer from 'puppeteer';
import fs from 'node:fs';

const svg = fs.readFileSync('/Users/ayush/Master-Code/blog/scratch/figure.svg', 'utf-8');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 820, height: 640 });
await page.setContent(`<body style="margin:0;background:#fff">${svg}</body>`);
await page.screenshot({ path: '/tmp/figure_check.png' });
await browser.close();

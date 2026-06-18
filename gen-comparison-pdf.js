import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

await page.goto(`file://${path.resolve(__dirname, 'BH-MarCom-vs-Industry-AI-Report.html')}`, { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluateHandle('document.fonts.ready');

// Clean generation - no DOM manipulation
await page.pdf({
  path: path.resolve(__dirname, 'BH-MarCom-vs-Industry-AI-Report.pdf'),
  format: 'Letter',
  margin: { top: '0.45in', bottom: '0.45in', left: '0.45in', right: '0.45in' },
  printBackground: true
});

await browser.close();
console.log('PDF generated: BH-MarCom-vs-Industry-AI-Report.pdf');

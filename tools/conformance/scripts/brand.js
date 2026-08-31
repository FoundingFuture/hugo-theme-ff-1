// The name in the brand cell stays inside the brand cell.
//
// The wordmark is set from two counts the partial passes: the longest
// word, and how many words there are. CSS cannot measure text, so the
// stylesheet divides the column's width by the first of those and hopes
// the result fits.
//
// It hopes with a constant, and a constant is an average character. A
// name of wide capitals is wider than the average, and the mark then
// paints past the dark cell onto the page beside it. "Conformance" ran
// 280px through a 223px box, and nothing clipped it.
//
// So this reads the mark against the box it is given, at every width the
// cell is drawn at.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = 'tools/conformance/public/ours';
const PAGE = 'kitchen-sink/long/index.html';

// The cell is the same width at every one of these, but the narrow
// layouts move and resize it, so read them all.
const WIDTHS = [360, 480, 700, 900, 1100, 1400, 1800, 2600];

// A pixel of rounding is a pixel. Anything more is ink outside the cell.
const SLACK = 1;

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    console.log('SKIP brand: playwright is not installed');
    console.log('  ' + error.message.split('\n')[0]);
    process.exit(3);
  }

  if (!fs.existsSync(path.resolve(ROOT, PAGE))) {
    console.log('SKIP brand: no build at ' + ROOT);
    process.exit(3);
  }

  const TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.json': 'application/json',
    '.xml': 'application/xml', '.woff2': 'font/woff2',
  };
  const server = http.createServer((request, response) => {
    let target = decodeURIComponent(request.url.split('?')[0]);
    if (target.endsWith('/')) target += 'index.html';
    const file = path.join(ROOT, path.normalize(target).replace(/^(\.\.[/\\])+/, ''));
    fs.readFile(file, (error, body) => {
      if (error) {
        response.writeHead(404).end('not found');
        return;
      }
      response.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'networkidle' });

  // The mark is drawn in a face the page loads. Measured before it
  // arrives, every width is the fallback's.
  await page.evaluate(() => document.fonts.ready);

  const drawn = await page.evaluate(() => !!document.querySelector('.wordmark-text'));
  if (!drawn) {
    console.log('brand: this site draws its own mark. Nothing to measure.');
    await browser.close();
    server.close();
    process.exit(0);
  }

  const over = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(20);
    const seen = await page.evaluate(() => {
      const mark = document.querySelector('.wordmark-text');
      const style = getComputedStyle(mark);
      return {
        ink: mark.scrollWidth,
        box: mark.clientWidth,
        size: parseFloat(style.fontSize),
        text: mark.textContent.trim(),
      };
    });
    if (seen.ink - seen.box > SLACK) over.push({ width, ...seen });
  }

  await browser.close();
  server.close();

  console.log(`brand: the mark read at ${WIDTHS.length} widths from ${WIDTHS[0]} to ${WIDTHS[WIDTHS.length - 1]}`);

  if (over.length) {
    const worst = over.reduce((a, b) => (b.ink - b.box > a.ink - a.box ? b : a));
    console.log(`assets/css/components/header.css:1: the mark paints outside its cell at ${over.length} of ${WIDTHS.length} widths.`);
    console.log(`  worst at ${worst.width}px wide: ${worst.ink}px of "${worst.text}" through a ${worst.box}px box,`);
    console.log(`  set at ${worst.size.toFixed(1)}px. Lower the divisor the font-size is built from.`);
    process.exit(1);
  }

  console.log('brand: the name stays inside the cell at every width.');
  process.exit(0);
}

main().catch((error) => {
  console.log('brand: ' + error.message);
  process.exit(1);
});

// The page frame stops growing, and where it stops is one number.
//
// Every comparable theme bounds its outer container. Congo caps its
// wrapper at 80rem, hugo-book at 90rem, PaperMod at 720px for the words
// and 1024px for the chrome. This theme capped the line of text at
// --measure and left the column holding it as minmax(0,1fr), which has
// no ceiling at all.
//
// That is invisible until a site writes the ordinary thing. A figure
// asking for max-width:100% lands on 1280px in Congo and on 4464px here,
// at a 5000px window, because 100% of an unbounded column is unbounded.
// Reported from a site whose diagrams did exactly that.
//
// So the cap is read from the stylesheet rather than written here, and
// checked at widths past it. A number nobody measured is how the anchor
// offset went wrong three times, which is the check next door.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = 'tools/conformance/public/ours';
const PAGE = 'kitchen-sink/long/index.html';

// Past the cap on purpose. Below it the frame is the window and there is
// nothing to test.
const WIDTHS = [1200, 1440, 1600, 2000, 2600, 3200, 5000];

// A frame within a pixel of the cap is the cap. Sub-pixel layout and a
// scrollbar's width both land inside this.
const SLACK = 1;

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    console.log('SKIP frame: playwright is not installed');
    console.log('  ' + error.message.split('\n')[0]);
    process.exit(3);
  }

  if (!fs.existsSync(path.resolve(ROOT, PAGE))) {
    console.log('SKIP frame: no build at ' + ROOT);
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

  // The cap in pixels, resolved by the browser from whatever unit the
  // stylesheet writes it in.
  const cap = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--frame,0)';
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  });

  if (!cap) {
    console.log('assets/css/base.css:1: no --frame. The page frame has no cap,');
    console.log('  so a column asking for 100% grows with the window and never stops.');
    await browser.close();
    server.close();
    process.exit(1);
  }

  const over = [];
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(14);
    const seen = await page.evaluate(() => document.body.getBoundingClientRect().width);
    const want = Math.min(width, cap);
    if (seen - want > SLACK) over.push({ width, seen, want });
  }

  await browser.close();
  server.close();

  console.log(`frame: cap ${cap.toFixed(0)}px, read at ${WIDTHS.length} widths to ${WIDTHS[WIDTHS.length - 1]}`);

  if (over.length) {
    const worst = over.reduce((a, b) => (b.seen - b.want > a.seen - a.want ? b : a));
    console.log(`assets/css/components/frame.css:1: the frame grows past its cap at ${over.length} of ${WIDTHS.length} widths.`);
    console.log(`  worst at ${worst.width}px wide: ${worst.seen.toFixed(0)}px where the cap is ${worst.want.toFixed(0)}px.`);
    console.log(`  A site asking a figure for 100% then gets a number nobody chose.`);
    process.exit(1);
  }

  console.log('frame: the page stops at its cap, and the window past it is ground.');
  process.exit(0);
}

main().catch((error) => {
  console.log('frame: ' + error.message);
  process.exit(1);
});

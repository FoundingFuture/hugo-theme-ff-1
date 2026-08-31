// The band's height, against the offset that has to clear it.
//
// The band is sticky at the top of the page, so a heading whose anchor
// was followed lands underneath it unless html's scroll-padding-top
// covers it. That offset is a number written by hand, --band-seen, and
// the band's height is not: it is whatever its content comes to at the
// width being read.
//
// Nothing else in the suite can see this. conform compares the shape of
// a page and not its geometry, and visual compares screenshots against
// the last release, reports rather than fails, and is refreshed by the
// release itself. A band that hides a heading is invisible to both.
//
// It has been wrong three times. Reserving room for the theme switch
// made the slab taller, which stretched the band, and every anchored
// heading sat nine pixels under it from v0.1.1 until it was measured.
// Adding the language row put three new values in without measuring any
// of them, over-covering by up to 31px. Giving the language codes a
// fixed width made the row taller and the number was short again.
//
// Each was found by hand, late. This finds them in under three seconds.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = 'tools/conformance/public/ours';

// The page is any page: the band is chrome and every page carries it.
const PAGE = 'kitchen-sink/long/index.html';

// 320 to 2600 covers a phone held upright to a desktop turned sideways.
// The step is 20px because the band changes with the tagline, which is
// sized by a container query and moves continuously: a coarser sweep
// steps over the width where it first goes short.
const FROM = 320;
const TO = 2600;
const STEP = 20;

// What the reader loses when the number is too small, and what they see
// when it is too large.
//
// Under is a heading hidden behind the band, which is the failure this
// gate exists for. Nothing may be under, at any width.
//
// Over is a heading sitting lower than it needs to. The band is shorter
// than its tallest wherever the tagline has not reached its cap, so some
// slack is not a defect. 40px is not slack, it is a number nobody
// measured.
const MAX_OVER = 40;

// How far the tagline may sit from the middle of the band it is centred
// in, measured on its ink rather than on its box. A line is centred or
// it is not, so this is a rounding allowance and nothing more.
const MAX_LEAN = 1;

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    console.log('SKIP band: playwright is not installed');
    console.log('  ' + error.message.split('\n')[0]);
    process.exit(3);
  }

  if (!fs.existsSync(path.resolve(ROOT, PAGE))) {
    console.log('SKIP band: no build at ' + ROOT);
    process.exit(3);
  }

  // Served over HTTP rather than opened from the disk. A built page
  // links its stylesheet by an absolute path, which under file:// walks
  // from the root of the disk and finds nothing, and an unstyled page
  // has no band to measure. visual.js learned this the same way.
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
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  await page.goto(`${origin}/${PAGE}`, { waitUntil: 'networkidle' });

  // The tagline is set in a face the page loads. Measured before it
  // arrives, the band is the height of the fallback.
  await page.evaluate(() => document.fonts.ready);

  const has = await page.evaluate(() => !!document.querySelector('.strip'));
  if (!has) {
    console.log('band: this build has no band. Nothing to clear.');
    await browser.close();
    server.close();
    process.exit(0);
  }

  const under = [];
  const over = [];
  let tallest = 0;
  let widths = 0;

  for (let width = FROM; width <= TO; width += STEP) {
    await page.setViewportSize({ width, height: 600 });

    // A step of its own for the layout to settle. The band's height
    // comes from a container query, and a measurement taken in the same
    // frame as the resize reports the width before it.
    await page.waitForTimeout(14);

    const seen = await page.evaluate(() => {
      const band = document.querySelector('.strip');
      const sticky = getComputedStyle(band).position === 'sticky';
      return {
        height: band.getBoundingClientRect().height,
        offset: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
        sticky,
      };
    });

    widths += 1;
    tallest = Math.max(tallest, seen.height);

    // Only a band that stays at the top can cover anything.
    if (!seen.sticky) continue;

    const slack = seen.offset - seen.height;
    if (slack < -0.01) under.push({ width, by: -slack });
    else if (slack > MAX_OVER) over.push({ width, by: slack });
  }

  // The tagline, in the band that lays it out as a centred row.
  //
  // A flex box centres the font's em box, and a face does not declare
  // that box around its ink. Asimovian gives 46 up and 14 down about the
  // baseline where the ink of a line runs 37 up and 9 down, so a line
  // centred by the box lands below the middle of the band. The reader
  // sees a descender against the rule with a gap above the capitals.
  //
  // The fixture publishes two languages, and a band carrying languages
  // is a column with the line held at its top, which is not this layout
  // and is not meant to be centred. Taking the row out gives exactly the
  // markup a one-language site renders, which is most sites, and is the
  // only way this build reaches the centred row at all.
  await page.evaluate(() => {
    document.querySelectorAll('.strip .langs').forEach((row) => row.remove());
  });

  const lean = [];
  let lines = 0;

  for (let width = FROM; width <= TO; width += STEP) {
    await page.setViewportSize({ width, height: 600 });
    await page.waitForTimeout(14);

    const seen = await page.evaluate(() => {
      const band = document.querySelector('.strip');
      const line = band && band.querySelector('p');
      if (!line) return null;

      // Only the centred row. The narrow layout stacks the band and
      // starts it, where the line sits at the top by design.
      const cb = getComputedStyle(band);
      if (cb.flexDirection !== 'row' || cb.alignItems !== 'center') return null;

      const cl = getComputedStyle(line);
      const box = band.getBoundingClientRect();
      const top = box.top + (parseFloat(cb.borderTopWidth) || 0);
      const bottom = box.bottom - (parseFloat(cb.borderBottomWidth) || 0);

      // Where the ink actually is. A canvas reports a face's own metrics
      // and the ink of a string in it, which is what the eye reads and
      // what no layout box carries.
      const ink = document.createElement('canvas').getContext('2d');
      ink.font = `${cl.fontStyle} ${cl.fontWeight} ${cl.fontSize} ${cl.fontFamily}`;
      const m = ink.measureText(line.textContent.trim());
      const leading = (parseFloat(cl.lineHeight) - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2;
      const baseline = line.getBoundingClientRect().top + leading + m.fontBoundingBoxAscent;

      return {
        above: (baseline - m.actualBoundingBoxAscent) - top,
        below: bottom - (baseline + m.actualBoundingBoxDescent),
      };
    });

    if (!seen) continue;
    lines += 1;
    if (Math.abs(seen.below - seen.above) > MAX_LEAN) {
      lean.push({ width, above: seen.above, below: seen.below });
    }
  }

  await browser.close();
  server.close();

  console.log(`band: ${widths} widths from ${FROM} to ${TO}, tallest ${tallest.toFixed(1)}px`);

  let status = 0;
  if (under.length) {
    const worst = under.reduce((a, b) => (b.by > a.by ? b : a));
    console.log(`assets/css/base.css:1: the anchor offset is short at ${under.length} of ${widths} widths.`);
    console.log(`  worst ${worst.by.toFixed(1)}px at ${worst.width}px wide. A heading whose anchor is`);
    console.log(`  followed lands behind the band. Raise --band-seen past ${tallest.toFixed(1)}px.`);
    status = 1;
  }
  if (over.length) {
    const worst = over.reduce((a, b) => (b.by > a.by ? b : a));
    console.log(`assets/css/base.css:1: the anchor offset overshoots at ${over.length} of ${widths} widths.`);
    console.log(`  worst ${worst.by.toFixed(1)}px at ${worst.width}px wide, over the ${MAX_OVER}px allowed.`);
    console.log(`  A heading lands that far below the band. Lower --band-seen toward ${tallest.toFixed(1)}px.`);
    status = 1;
  }
  if (lean.length) {
    const worst = lean.reduce((a, b) =>
      (Math.abs(b.below - b.above) > Math.abs(a.below - a.above) ? b : a));
    console.log(`assets/css/components/header.css:1: the tagline sits off centre at ${lean.length} of ${lines} widths.`);
    console.log(`  worst at ${worst.width}px wide: ${worst.above.toFixed(1)}px above the ink and`);
    console.log(`  ${worst.below.toFixed(1)}px below it. A flex box centres the em box, and a face`);
    console.log(`  does not declare that box around its ink.`);
    status = 1;
  }
  if (!status) {
    console.log(`band: the offset clears it at every width, and by no more than ${MAX_OVER}px.`);
    console.log(`band: the tagline is centred on its ink at ${lines} widths.`);
  }
  process.exit(status);
}

main().catch((error) => {
  console.log('band: ' + error.message);
  process.exit(1);
});

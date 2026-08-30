// Every piece of text on the page, against the ground it is drawn on.
//
// The theme has two contrast gates already and neither sees this. axe
// reports a colour it cannot be certain about as "needs review" rather
// than a violation, and pa11yci runs with includeWarnings off, so the
// finding is dropped. Lighthouse uses axe and reports the same way.
// base.css records this happening once, for --muted at 3.01 to 1.
//
// It happened again, and worse. Every token colour in dark-mode.css was
// written without its [data-theme="dark"] prefix, so the dark palette
// painted code in light mode too: identifiers at 1.38 to 1 on a pale
// ground, through three releases, with both gates green.
//
// So this one does the arithmetic itself rather than asking. It walks
// the text, resolves the colours, and divides.
//
// Both themes. The fault above was invisible in dark and unreadable in
// light, and a gate that reads one of them would have missed it.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = 'tools/conformance/public/ours';

// WCAG 2.2 contrast minimum: 4.5 for body text, 3 for large. Large is
// 24px, or 18.66px when the weight is 700 or more.
const AA_NORMAL = 4.5;
const AA_LARGE = 3;
const LARGE_PX = 24;
const LARGE_BOLD_PX = 18.66;

// Reported as a fraction, so a colour that misses by a rounding error in
// the last decimal is not a failure.
const SLACK = 0.05;

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    console.log('SKIP contrast: playwright is not installed');
    console.log('  ' + error.message.split('\n')[0]);
    process.exit(3);
  }
  if (!fs.existsSync(path.resolve(ROOT, 'index.html'))) {
    console.log('SKIP contrast: no build at ' + ROOT);
    process.exit(3);
  }

  // An alias is a meta refresh and nothing else. Opening one navigates
  // away while the measurement is running and the context it was running
  // in is destroyed. validity.sh leaves them out for its own reasons;
  // this leaves them out because there is no text on them to read.
  const pages = [];
  let redirects = 0;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (entry.name !== 'index.html') continue;
      if (/http-equiv=["']?refresh/i.test(fs.readFileSync(full, 'utf8'))) { redirects += 1; continue; }
      pages.push(path.relative(ROOT, full));
    }
  })(ROOT);

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
      if (error) { response.writeHead(404).end('not found'); return; }
      response.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
      response.end(body);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  const failures = [];
  let checked = 0;
  let unmeasured = 0;

  for (const rel of pages) {
    for (const theme of ['light', 'dark']) {
      await page.goto(`${origin}/${rel}`, { waitUntil: 'load' });

      // Stillness first. The theme fades colour over .18s whenever it
      // changes, and a measurement taken the instant the theme is set
      // reads a colour part way between the two palettes: the first run
      // of this gate reported light mode's body colour sitting on a dark
      // ground and called it a failure at 1.75 to 1. Neither number was
      // a colour anyone would ever see.
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none !important;animation:none !important}' });
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      // The faces change the size of a run of text but never its colour,
      // so a missing one cannot change the answer. Waited for anyway, so
      // the element boxes are the ones a reader gets.
      await page.evaluate(() => document.fonts.ready).catch(() => {});

      const found = await page.evaluate((limits) => {
        // Canvas is the only thing here that resolves a modern colour
        // function to sRGB. getComputedStyle hands back oklab() and
        // color-mix() untouched, and the arithmetic below needs numbers.
        const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const cache = new Map();
        const rgba = (value) => {
          if (cache.has(value)) return cache.get(value);
          probe.clearRect(0, 0, 1, 1);
          probe.fillStyle = '#000';
          probe.fillStyle = value;
          probe.fillRect(0, 0, 1, 1);
          const d = probe.getImageData(0, 0, 1, 1).data;
          const out = [d[0], d[1], d[2], d[3] / 255];
          cache.set(value, out);
          return out;
        };
        const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
        const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));

        // The ground a run of text is actually drawn on: the nearest
        // ancestor that paints something opaque. A translucent one is
        // composited onto what is behind it.
        const groundOf = (el) => {
          const stack = [];
          for (let n = el; n; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.backgroundImage !== 'none') return null;  // cannot be read as one colour
            const c = rgba(cs.backgroundColor);
            if (c[3] > 0) { stack.push(c); if (c[3] === 1) break; }
          }
          // Nothing painted anywhere up the tree. That is the canvas
          // itself, which the browser paints from html or body; asking
          // for it directly beats assuming white, which in dark mode is
          // the one answer that is certainly wrong.
          if (!stack.length) {
            const canvas = rgba(getComputedStyle(document.documentElement).backgroundColor);
            if (canvas[3] > 0) return canvas.slice(0, 3);
            const fromBody = rgba(getComputedStyle(document.body).backgroundColor);
            return fromBody[3] > 0 ? fromBody.slice(0, 3) : [255, 255, 255];
          }
          let ground = stack[stack.length - 1].slice(0, 3);
          for (let i = stack.length - 2; i >= 0; i -= 1) ground = over(stack[i], ground);
          return ground;
        };

        const out = [];
        let seen = 0;
        let skipped = 0;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const done = new Set();
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.nodeValue.trim()) continue;
          const el = node.parentElement;
          if (!el || done.has(el)) continue;
          done.add(el);
          if (el.closest('[aria-hidden="true"]')) continue;
          // A stretched operator is drawn by the browser at a size axe
          // cannot measure either; pa11yci hides the same two.
          if (el.closest('math msubsup > mo, math munderover > mo')) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if (parseFloat(cs.opacity) === 0) continue;
          const box = el.getBoundingClientRect();
          if (box.width < 1 || box.height < 1) continue;

          const ground = groundOf(el);
          if (!ground) { skipped += 1; continue; }
          const fg = rgba(cs.color);
          const ink = fg[3] < 1 ? over(fg, ground) : fg.slice(0, 3);

          const size = parseFloat(cs.fontSize);
          const weight = parseInt(cs.fontWeight, 10) || 400;
          const large = size >= limits.LARGE_PX || (size >= limits.LARGE_BOLD_PX && weight >= 700);
          const need = large ? limits.AA_LARGE : limits.AA_NORMAL;

          const a = lum(ink);
          const bl = lum(ground);
          const ratio = (Math.max(a, bl) + 0.05) / (Math.min(a, bl) + 0.05);
          seen += 1;
          if (ratio < need - limits.SLACK) {
            const cls = (el.className && el.className.baseVal === undefined && el.className) || '';
            out.push({
              where: el.tagName.toLowerCase() + (cls ? '.' + String(cls).trim().split(/\s+/)[0] : ''),
              ratio: Math.round(ratio * 100) / 100,
              need,
              size: Math.round(size * 10) / 10,
              text: node.nodeValue.trim().slice(0, 30),
              // What the arithmetic was done on, so a report can be
              // checked rather than believed.
              ink: `rgb(${ink.map(Math.round).join(',')})`,
              ground: `rgb(${ground.map(Math.round).join(',')})`,
              raw: cs.color,
            });
          }
        }
        return { out, seen, skipped };
      }, { AA_NORMAL, AA_LARGE, LARGE_PX, LARGE_BOLD_PX, SLACK });

      checked += found.seen;
      unmeasured += found.skipped;
      for (const f of found.out) failures.push({ page: rel, theme, ...f });
    }
  }

  await browser.close();
  server.close();

  console.log(`contrast: ${checked} runs of text over ${pages.length} pages, light and dark`);
  if (redirects) console.log(`contrast: ${redirects} alias page(s) left out, which carry no text`);
  if (unmeasured) {
    console.log(`contrast: ${unmeasured} sat on a gradient or image and were not measured`);
  }

  if (!failures.length) {
    console.log('contrast: every one clears WCAG AA against the ground it is drawn on');
    process.exit(0);
  }

  // One line per distinct fault, not per occurrence: a colour written
  // once fails on every page that carries it, and the fix is one edit.
  const distinct = new Map();
  for (const f of failures) {
    const key = `${f.theme}|${f.where}|${f.ratio}`;
    if (!distinct.has(key)) distinct.set(key, { ...f, pages: 0 });
    distinct.get(key).pages += 1;
  }
  const worst = [...distinct.values()].sort((a, b) => a.ratio - b.ratio);
  console.log(`assets/css/base.css:1: ${distinct.size} colour(s) below WCAG AA.`);
  for (const f of worst.slice(0, 12)) {
    console.log(`  ${f.theme.padEnd(5)} ${f.where.padEnd(20)} ${String(f.ratio).padStart(5)} to 1`
      + ` (needs ${f.need}, ${f.size}px, ${f.pages} page${f.pages === 1 ? '' : 's'})`);
    console.log(`        ${f.ink} on ${f.ground}   "${f.text}"   first seen ${f.page}`);
  }
  if (worst.length > 12) console.log(`  and ${worst.length - 12} more.`);
  process.exit(1);
}

main().catch((error) => {
  console.log('contrast: ' + error.message);
  process.exit(1);
});

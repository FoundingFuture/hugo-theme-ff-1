// Every element Markdown can put in a piece, and whether the theme has
// anything to say about it.
//
// A table shipped unstyled from v0.1.0 to v0.2.4. It was in the fixture
// the whole time, on kitchen-sink/goldmark. Every gate passed it: the
// markup was valid, the structure matched the scaffold, and the text
// cleared AA against the page it sat on. None of them asks whether the
// theme drew it, because a browser's own defaults are valid, structured
// and legible. They are just not this theme.
//
// So this asks the browser a question it can answer exactly: for this
// element, did any rule the theme wrote match? Not whether it looks
// right, which is taste. Whether the theme said anything at all, which
// is a fact.
//
// It reads what the fixture actually renders rather than a list written
// here. An element no page contains cannot be checked, and the gate says
// so rather than passing it in silence.
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = 'tools/conformance/public/ours';

// Elements whose browser default is the right answer, with the reason.
// An exemption is a decision, so each one is written down.
const EXEMPT = {
  br: 'a line break draws nothing',
  wbr: 'a break opportunity draws nothing',
  strong: 'bolder is what bold means, and the face carries a bold',
  em: 'italic is what emphasis means',
  del: 'a line through is what deletion means',
  span: 'generic, and carries a class when it means something',
  div: 'generic, and carries a class when it means something',
  a: 'a11y.css styles every link, and it is checked there',
  source: 'a candidate file for the picture above it, and draws nothing',
  thead: 'a row group draws nothing of its own. Its cells carry the rules',
  tbody: 'a row group draws nothing of its own. Its cells carry the rules',
  tr: 'a row draws nothing of its own. Its cells carry the rules',
};

async function main() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (error) {
    console.log('SKIP prose: playwright is not installed');
    console.log('  ' + error.message.split('\n')[0]);
    process.exit(3);
  }
  if (!fs.existsSync(path.resolve(ROOT, 'index.html'))) {
    console.log('SKIP prose: no build at ' + ROOT);
    process.exit(3);
  }

  const pages = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (entry.name !== 'index.html') continue;
      if (/http-equiv=["']?refresh/i.test(fs.readFileSync(full, 'utf8'))) continue;
      pages.push(path.relative(ROOT, full));
    }
  })(ROOT);

  const TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.json': 'application/json',
    '.xml': 'application/xml', '.woff2': 'font/woff2', '.webp': 'image/webp',
    '.avif': 'image/avif',
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

  const seen = new Map();   // tag -> {styled, bare, page}
  const wide = [];          // anything reaching past the reading line
  for (const rel of pages) {
    await page.goto(`${origin}/${rel}`, { waitUntil: 'load' });
    const found = await page.evaluate(() => {
      // Every selector the theme wrote, once. A pseudo-element is cut
      // off: ::before is a rule about the element, and matches() throws
      // on it. A pseudo-class stays, because :hover on a row is still
      // the theme having something to say about that row.
      const selectors = [];
      for (const sheet of document.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch (error) { continue; }
        // A rule can both carry a selector and hold others. Since CSS
        // nesting shipped, every style rule has a cssRules list, and an
        // empty CSSRuleList is an object, so it is truthy. Treating that
        // as "this rule is a container, skip it" walked past every rule
        // the theme wrote and collected nothing. The gate then reported
        // the whole theme as unstyled, table and paragraph alike.
        const collect = (list) => {
          for (const rule of list) {
            if (rule.selectorText) {
              for (const one of rule.selectorText.split(',')) {
                const cleaned = one.trim().replace(/::[a-z-]+(\([^)]*\))?/g, '');
                if (cleaned) selectors.push(cleaned);
              }
            }
            if (rule.cssRules && rule.cssRules.length) collect(rule.cssRules);
          }
        };
        collect(rules);
      }

      // The element a selector is about is its last compound. A rule
      // has something to say about a table when it ends in "table", not
      // when the table merely happens to match it.
      //
      // Without this the gate passed everything, because the reading
      // measure is set by [data-part="body"]>*, and every child of the
      // body matches that. A rule that names no element is a rule about
      // the column, not about what is in it.
      const subjectOf = (selector) => {
        let depth = 0;
        let flat = '';
        for (const ch of selector) {
          if (ch === '[' || ch === '(') depth += 1;
          else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1);
          flat += (depth > 0 && /[\s>+~]/.test(ch)) ? '' : ch;
        }
        const parts = flat.split(/[\s>+~]+/).filter(Boolean);
        const last = (parts[parts.length - 1] || '').replace(//g, ' ');
        const named = last.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
        return named ? named[1].toLowerCase() : null;
      };
      const byTag = new Map();
      for (const selector of selectors) {
        const tag = subjectOf(selector);
        if (!tag) continue;
        if (!byTag.has(tag)) byTag.set(tag, []);
        byTag.get(tag).push(selector);
      }

      const out = {};
      const body = document.querySelector('[data-part="body"]');
      if (!body) return out;
      for (const el of body.querySelectorAll('*')) {
        // Inside a code block every token carries a class from Chroma,
        // and those are checked by the contrast gate rather than here.
        if (el.closest('pre, math, svg')) continue;
        const tag = el.tagName.toLowerCase();
        let styled = false;
        // Named for this element, and reaching this element where it
        // sits. A rule for a link in the menu says nothing about a link
        // in a paragraph.
        for (const selector of byTag.get(tag) || []) {
          try { if (el.matches(selector)) { styled = true; break; } } catch (error) { /* not a selector matches() takes */ }
        }
        if (!out[tag]) out[tag] = { styled: 0, bare: 0 };
        out[tag][styled ? 'styled' : 'bare'] += 1;
      }
      // Nothing in a piece is wider than the line the text keeps.
      //
      // The measure is set on the children of the body, and max-width
      // does not apply to an inline box. A formula arrives wrapped in a
      // span, so its cap was inert and it filled the body's content box
      // instead: 964px against a 765px paragraph, then centred itself
      // and sat out to the right of the text. Every gate passed it.
      out.__wide = [];
      const line = body.querySelector('p');
      if (line) {
        const edge = Math.round(line.getBoundingClientRect().right);
        // Something inside a box that scrolls is clipped by it, so a
        // reader never sees it reach anywhere. A wide table is meant to
        // extend past the line inside its own scroller: that is the
        // answer, not the fault.
        const clipped = (el) => {
          for (let n = el.parentElement; n && n !== body; n = n.parentElement) {
            const flow = getComputedStyle(n).overflowX;
            if (flow === 'auto' || flow === 'scroll' || flow === 'hidden') return true;
          }
          return false;
        };
        for (const el of body.querySelectorAll('*')) {
          if (el.closest('pre, .footnotes')) continue;
          if (clipped(el)) continue;
          const box = el.getBoundingClientRect();
          if (box.width < 1) continue;
          // Two pixels of slack, because a border can round outwards.
          if (Math.round(box.right) > edge + 2) {
            out.__wide.push({
              what: el.tagName.toLowerCase()
                + (el.getAttribute('display') === 'block' ? '[display=block]' : ''),
              right: Math.round(box.right),
              edge,
            });
          }
        }
      }
      return out;
    });

    for (const row of found.__wide || []) {
      wide.push({ page: rel, ...row });
    }
    delete found.__wide;

    for (const [tag, counts] of Object.entries(found)) {
      const row = seen.get(tag) || { styled: 0, bare: 0, page: rel };
      row.styled += counts.styled;
      row.bare += counts.bare;
      if (counts.bare && !row.barePage) row.barePage = rel;
      seen.set(tag, row);
    }
  }

  await browser.close();
  server.close();

  const bare = [...seen.entries()]
    .filter(([tag, row]) => row.bare > 0 && !EXEMPT[tag])
    .sort((a, b) => b[1].bare - a[1].bare);

  console.log(`prose: ${seen.size} kinds of element over ${pages.length} pages`);
  const exempted = [...seen.keys()].filter((tag) => EXEMPT[tag]);
  if (exempted.length) {
    console.log(`prose: ${exempted.length} left to the browser on purpose: ${exempted.join(' ')}`);
  }

  // One line per kind of element, not per occurrence: a formula that
  // escapes the measure escapes it on every page that carries one.
  if (wide.length) {
    const kinds = new Map();
    for (const row of wide) {
      if (!kinds.has(row.what)) kinds.set(row.what, { ...row, pages: 0 });
      kinds.get(row.what).pages += 1;
    }
    console.log(`assets/css/components/piece.css:1: ${kinds.size} thing(s) reach past the reading line.`);
    for (const row of kinds.values()) {
      console.log(`  <${row.what}>`.padEnd(26)
        + `ends at ${row.right}, the text ends at ${row.edge}`
        + `  (${row.pages} page${row.pages === 1 ? '' : 's'})`);
      console.log(`        first seen ${row.page}`);
    }
    console.log('  A reader sees a formula or a picture sitting out to the right of');
    console.log('  the words. max-width does not apply to an inline box, so a cap on');
    console.log('  a span wrapper is inert.');
  }

  if (!bare.length && !wide.length) {
    console.log('prose: the theme has a rule for every one of the rest');
    console.log('prose: and nothing reaches past the line the text keeps');
    process.exit(0);
  }
  if (!bare.length) process.exit(1);

  console.log(`assets/css/components/piece.css:1: ${bare.length} element(s) the theme never styles.`);
  for (const [tag, row] of bare) {
    console.log(`  <${tag}>`.padEnd(16)
      + `${row.bare} unstyled`.padEnd(16)
      + `first seen ${row.barePage}`);
  }
  console.log('  A browser default is valid, structured and legible. It is not this theme.');
  process.exit(1);
}

main().catch((error) => {
  console.log('prose: ' + error.message);
  process.exit(1);
});

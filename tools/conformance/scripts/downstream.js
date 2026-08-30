// A site built the way a stranger builds one, from what the README says.
//
// Every other gate reads a site this repository wrote. The fixture and
// exampleSite are both set up the way the theme wants, so anything the
// theme needs the site to declare is already declared, and the
// requirement cannot fail. That blind spot shipped three times:
//
//   - passthrough was never enabled outside the fixture, so a formula
//     written by anyone else came out with its delimiters eaten and the
//     build said nothing
//   - noClasses was never set outside the fixture, so code blocks
//     arrived in Chroma's inline palette with the theme's own code
//     colours applying to nothing, and dark mode unable to remap them
//   - neither was named in the README, so there was nowhere to find out
//
// So this gate does not read a site in the repository. It writes one:
// the config blocks the README publishes, content that exercises each
// feature they belong to, the artefact from dist, and nothing else. If
// the README is wrong or silent, the build it describes fails here.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const README = 'README.md';
const CONTENT = `+++
title = 'Downstream'
+++

Inline \\(E = mc^2\\) and a block:

\\[
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
\\]

\`\`\`python
def hello(name):
    return f"hi {name}"
\`\`\`
`;

// Every toml block the README publishes, in order. A block that belongs
// in a site's config is one a reader will paste, so this pastes them.
function configFromReadme(text) {
  const blocks = [...text.matchAll(/```toml\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.filter((b) => /^\[/m.test(b));
}

function main() {
  const slug = execFileSync('tools/scripts/slug.sh', { encoding: 'utf8' }).trim();
  const artefact = path.resolve('dist', slug);
  if (!fs.existsSync(artefact)) {
    console.log(`SKIP downstream: no artefact at dist/${slug}. ./c package writes it`);
    process.exit(3);
  }
  if (!fs.existsSync(README)) {
    console.log('SKIP downstream: no README.md');
    process.exit(3);
  }

  const blocks = configFromReadme(fs.readFileSync(README, 'utf8'));
  const need = ['markup.goldmark.extensions.passthrough', 'markup.highlight'];
  const missing = need.filter((k) => !blocks.some((b) => b.includes(`[${k}]`)));
  if (missing.length) {
    for (const key of missing) {
      console.log(`README.md:1: nothing tells a site to set [${key}].`);
    }
    console.log('  The theme needs it and cannot set it: Hugo does not merge markup');
    console.log('  from a theme. A reader who never sees it gets a build that succeeds');
    console.log('  and a page that is wrong.');
    process.exit(1);
  }

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'ff-downstream-'));
  try {
    fs.mkdirSync(path.join(work, 'content'));
    fs.mkdirSync(path.join(work, 'themes'));
    fs.cpSync(artefact, path.join(work, 'themes', slug), { recursive: true });
    fs.writeFileSync(path.join(work, 'content', 'downstream.md'), CONTENT);
    fs.writeFileSync(
      path.join(work, 'hugo.toml'),
      `baseURL = 'https://example.org/'\ntitle = 'Downstream'\ntheme = '${slug}'\n\n`
        + blocks.join('\n'),
    );

    try {
      execFileSync('hugo', ['--logLevel', 'warn', '--gc'], { cwd: work, stdio: 'pipe' });
    } catch (error) {
      console.log('README.md:1: the configuration the README publishes does not build.');
      console.log('  ' + String(error.stderr || error.message).split('\n').slice(0, 4).join('\n  '));
      process.exit(1);
    }

    const page = path.join(work, 'public', 'downstream', 'index.html');
    if (!fs.existsSync(page)) {
      console.log('README.md:1: the site built but wrote no page.');
      process.exit(1);
    }
    const html = fs.readFileSync(page, 'utf8');

    let status = 0;
    // Rendered mathematics is a math element, whatever output mode is on.
    const maths = (html.match(/<math/g) || []).length;
    if (maths < 2) {
      console.log(`README.md:1: a formula did not render. ${maths} math elements, wanted 2.`);
      console.log('  Goldmark ate the delimiters, so the render hook never fired.');
      console.log('  Check the passthrough block the README publishes.');
      status = 1;
    }
    // Chroma writing classes rather than a palette baked into the markup.
    if (/<pre[^>]*style="[^"]*color:/.test(html)) {
      console.log('README.md:1: a code block carries Chroma colours as inline styles.');
      console.log('  The theme\'s code colours have nothing to colour, and dark mode');
      console.log('  cannot remap them. Check noClasses in the README\'s highlight block.');
      status = 1;
    }
    if (!status) {
      console.log(`downstream: a site built from the README renders ${maths} formulas`);
      console.log('downstream: and code blocks the theme can colour');
    }
    process.exit(status);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main();

const fs = require('node:fs');
const path = require('node:path');

// Workers serves at the origin root; GitHub Pages explicitly selects its prefix.
const base = (process.env.SITE_BASE_PATH || '').replace(/\/$/, '');
if (base && !/^\/[a-zA-Z0-9/_-]+$/.test(base)) {
  throw new Error('SITE_BASE_PATH must be a URL path such as /portfolio');
}
const out = 'ux-portfolio/dist';
const pages = [
  ['index', ''], ['about', 'about'], ['triply', 'work/triply'],
  ['fluffbud', 'work/fluffbud'], ['m-echo', 'work/m-echo'], ['reedy', 'work/reedy'],
];
fs.mkdirSync(out, { recursive: true });
for (const [name, route] of pages) {
  const dir = path.join(out, route);
  fs.mkdirSync(dir, { recursive: true });
  let html = fs.readFileSync(`ux-portfolio/${name}.html`, 'utf8');
  if (base) {
    html = html.replace(/(["'])\/(assets\/|cursor-trail\.js|work\/|about)/g, '$1' + base + '/$2')
      .replace(/href="\/"/g, 'href="' + base + '/"');
  }
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
fs.cpSync('ux-portfolio/assets', out + '/assets', { recursive: true });
fs.copyFileSync('ux-portfolio/cursor-trail.js', out + '/cursor-trail.js');
fs.writeFileSync(out + '/.nojekyll', '');
console.log(`Built static routes at ${base || '/'}`);

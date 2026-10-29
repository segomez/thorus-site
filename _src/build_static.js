// Static site generator for thorusconsulting.com (GitHub Pages ready).
// Usage: node build_static.js <outDir>
// Edit CONFIG below, the copy in content.js and the articles in blog.js, then rebuild.
const fs = require('fs');
const path = require('path');
const { contact, en, es } = require('./content');
const { blog } = require('./blog');

const CONFIG = {
  domain: 'https://thorusconsulting.com',
  // Google Calendar appointment schedule link (Calendar > Create > Appointment schedule > Share)
  bookingUrl: 'https://calendar.app.google/REPLACE_WITH_YOUR_LINK',
  // Email tool form endpoint per lead magnet (Kit, Mailchimp, Formspree…). Leave REPLACE_ to keep the form in demo mode.
  forms: {
    'project-rescue': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
    'oversold': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
    'it-partner': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
    'transformacion-digital': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
    'socio-tecnologico': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
    'mercado-eeuu': 'https://app.kit.com/forms/REPLACE_FORM_ID/subscriptions',
  },
  // YouTube video IDs (the part after watch?v=). Empty = animated placeholder.
  videos: { 'en-home': '', 'es-home': '', 'project-rescue': '', 'oversold': '', 'it-partner': '', 'transformacion-digital': '', 'socio-tecnologico': '', 'mercado-eeuu': '' },
};

// Default output: the site root (the folder that contains _src). Existing files are overwritten, never deleted.
const OUT = process.argv[2] || path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
let css = tpl.slice(tpl.indexOf('<style>') + 7, tpl.indexOf('</style>'));
css = css.replace(/\.proto[^\n]*\n/g, '');
css += `
/* static-site additions */
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; }
img { max-width: 100%; }
[hidden] { display: none !important; }
a.door, a.post-card { text-decoration: none; }
a.btn { text-decoration: none; }
.hnav a.navlink, .hnav a.lang { text-decoration: none; display: inline-block; }
.crumb a { color: var(--teal); text-decoration: none; font-weight: 500; }
a.post-link { text-decoration: none; display: block; }
.video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.skip { position: absolute; left: -9999px; }
.skip:focus { left: 1rem; top: 1rem; z-index: 20; background: var(--surface); padding: .5rem 1rem; }
`;

const UI = {
  en: { blog: 'Blog', blogTitle: 'Plain talk on technology decisions', blogIntro: 'Short, practical articles for owners and executives who need to make technology decisions without the jargon.', fromBlog: 'From the blog', allPosts: 'All articles', related: 'Related reading', min: 'min read', relatedTo: 'Related situation', ctaEyebrow: 'Does this sound like your company?', ctaGo: 'Read the full guide', back: 'All articles', who: 'Who you’ll work with', readScript: 'Read the video transcript', talkTitle: '30-minute conversation', free: 'Free resource:', skip: 'Skip to content', notFound: 'Page not found', notFoundBody: 'The page you are looking for moved or never existed.' },
  es: { blog: 'Blog', blogTitle: 'Decisiones de tecnología, en lenguaje claro', blogIntro: 'Artículos cortos y prácticos para dueños y gerentes que necesitan tomar decisiones de tecnología sin jerga.', fromBlog: 'Del blog', allPosts: 'Todos los artículos', related: 'Lecturas relacionadas', min: 'min de lectura', relatedTo: 'Situación relacionada', ctaEyebrow: '¿Le suena a su empresa?', ctaGo: 'Ver la guía completa', back: 'Todos los artículos', who: 'Quién está detrás', readScript: 'Leer la transcripción del video', talkTitle: 'Conversación de 30 minutos', free: 'Recurso gratuito:', skip: 'Ir al contenido', notFound: 'Página no encontrada', notFoundBody: 'La página que busca cambió de lugar o no existe.' },
};

const nb = s => String(s).replace(/EE\. UU\./g, 'EE. UU.');
const esc = s => nb(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const D = { en, es };
const prefix = lang => (lang === 'es' ? 'es/' : '');
// route paths (relative to site root, folder style)
const P = {
  home: lang => prefix(lang),
  problem: (lang, slug) => `${prefix(lang)}${slug}/`,
  blog: lang => `${prefix(lang)}blog/`,
  post: (lang, slug) => `${prefix(lang)}blog/${slug}/`,
};
const postsOf = lang => blog.filter(b => b.lang === lang);
const words = b => b.body.map(x => typeof x === 'string' ? x : x.h || (x.list || []).join(' ')).join(' ').split(/\s+/).length;
const readMin = b => Math.max(2, Math.round(words(b) / 220));

function rel(from, to) {
  // from/to are folder paths like 'es/blog/x/' ; returns relative href
  const depth = from.split('/').filter(Boolean).length;
  return ('../'.repeat(depth) + to) || './';
}

function videoBlock(key, label, inline) {
  const id = CONFIG.videos[key];
  const inner = id
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${esc(label)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
    : `<canvas aria-hidden="true"></canvas><div class="play"><div class="disc"></div><div class="vl">${esc(label)}</div></div><div class="face">Sebastián Gómez</div>`;
  return `<div class="video ${inline ? 'inline' : ''}">${inner}</div>`;
}
const transcript = (lines, lang) => `<details class="script"><summary>${UI[lang].readScript}</summary><div>${lines.map(s => `<p>${esc(s)}</p>`).join('')}</div></details>`;

function postCard(here, b, noTag) {
  const pr = D[b.lang].problems.find(p => p.slug === b.problem);
  return `<a class="post-card" href="${rel(here, P.post(b.lang, b.slug))}">${noTag ? '' : `<span class="mono">${esc(pr.button)}</span>`}<strong>${esc(b.title)}</strong><span class="d">${esc(b.dek)}</span><span class="d">${readMin(b)} ${UI[b.lang].min}</span></a>`;
}
function door(here, L, p, i) {
  return `<a class="door" href="${rel(here, P.problem(L.lang, p.slug))}"><span class="n">${i + 1}</span><span class="txt"><strong>${esc(p.button)}</strong><span>${esc(p.teaser)}</span></span><span class="arrow" aria-hidden="true">→</span></a>`;
}

function page({ lang, here, alt, title, description, body, talkHref }) {
  const L = D[lang];
  const other = lang === 'en' ? 'es' : 'en';
  const canonical = CONFIG.domain + '/' + here;
  const altUrl = CONFIG.domain + '/' + alt;
  const enUrl = lang === 'en' ? canonical : altUrl;
  const esUrl = lang === 'es' ? canonical : altUrl;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<link rel="alternate" hreflang="es" href="${esUrl}">
<link rel="alternate" hreflang="x-default" href="${enUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${lang === 'es' ? 'es_CO' : 'en_US'}">
<link rel="icon" href="${rel(here, 'assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="${rel(here, 'assets/style.css')}">
</head>
<body>
<a class="skip" href="#main">${UI[lang].skip}</a>
<header class="site">
  <div class="wrap">
    <a class="brand" href="${rel(here, P.home(lang))}"><b>THORUS</b><span>Consulting</span></a>
    <nav class="hnav" aria-label="${lang === 'es' ? 'Principal' : 'Main'}">
      <a class="navlink" href="${rel(here, P.blog(lang))}">${UI[lang].blog}</a>
      <a class="lang" href="${rel(here, alt)}" hreflang="${other}" lang="${other}">${L.nav.switchTo}</a>
      <a class="btn" href="${talkHref || CONFIG.bookingUrl}" ${talkHref ? '' : 'target="_blank" rel="noopener"'}>${esc(L.nav.talk)}</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer><div class="wrap"><span>${esc(L.footer)}</span><span>${esc(contact.email)} · ${esc(contact.phone)} · <a href="https://www.${contact.linkedin}" target="_blank" rel="noopener">LinkedIn</a></span></div></footer>
<script src="${rel(here, 'assets/site.js')}" defer></script>
</body>
</html>
`;
}

function homePage(lang) {
  const L = D[lang], h = L.home, here = P.home(lang), U = UI[lang];
  const body = `
<section class="hero"><div class="wrap">
  <div class="hero-copy"><div class="mono eyebrow">${esc(h.eyebrow)}</div><h1>${esc(h.title)}</h1></div>
  <div style="min-width:0">${videoBlock(lang + '-home', h.videoLabel, false)}</div>
</div></section>
<section class="doors"><div class="wrap">
  <div style="margin:0 0 1.75rem">${transcript(h.script, lang)}</div>
  <p class="lead">${esc(h.lead)}</p>
  <div class="door-list">${L.problems.map((p, i) => door(here, L, p, i)).join('')}</div>
</div></section>
<section class="wrap blogsec" style="padding-bottom:0"><h2>${U.fromBlog}</h2><div class="blog-grid">${postsOf(lang).slice(0, 3).map(b => postCard(here, b)).join('')}</div>
  <p style="margin-top:1rem"><a class="post-link" style="border:0;padding:0" href="${rel(here, P.blog(lang))}">${U.allPosts} →</a></p></section>
<section class="wrap about">
  <div><div class="mono" style="color:var(--teal)">${U.who}</div><h2>Sebastián Gómez</h2><p>${esc(h.about)}</p></div>
  <ul class="proof">${h.proof.map(([n, l]) => `<li><b>${esc(n)}</b><span>${esc(l)}</span></li>`).join('')}</ul>
</section>`;
  return page({ lang, here, alt: P.home(lang === 'en' ? 'es' : 'en'), title: lang === 'en' ? 'Thorus Consulting · Digital transformation advisory' : 'Thorus Consulting · Transformación digital y expansión a EE. UU.', description: h.title, body });
}

function problemPage(lang, p, idx) {
  const L = D[lang], S = L.sections, U = UI[lang], here = P.problem(lang, p.slug);
  const otherLang = lang === 'en' ? 'es' : 'en';
  const alt = P.problem(otherLang, D[otherLang].problems[idx].slug);
  const related = postsOf(lang).filter(b => b.problem === p.slug);
  const formAction = CONFIG.forms[p.slug];
  const body = `
<div class="wrap narrow">
  <div class="crumb"><a href="${rel(here, P.home(lang))}">← ${esc(L.nav.home)}</a></div>
  <div class="ptitle"><h1>${esc(p.title)}</h1></div>
  ${videoBlock(p.slug, p.videoLabel, true)}
  ${transcript(p.script, lang)}
  <section class="sec"><h2>${esc(S.why)}</h2>${p.why.map(w => `<p>${esc(w)}</p>`).join('')}</section>
  <section class="sec callout"><div class="mono">${esc(S.notConsidered)}</div><p>${esc(p.notConsidered)}</p></section>
  <section class="sec"><h2>${esc(S.think)}</h2>
    <ol class="think">${p.think.map(([a, b]) => `<li><div><strong>${esc(a)}</strong><span>${esc(b)}</span></div></li>`).join('')}</ol>
  </section>
  <div class="close" id="talk">
    <div class="talk">
      <div class="mono">${esc(L.talkLabel)}</div>
      <h3>${U.talkTitle}</h3>
      <p>${esc(p.cta)}</p>
      <a class="btn" href="${CONFIG.bookingUrl}" target="_blank" rel="noopener">${esc(L.nav.talk)}</a>
      <small>${esc(contact.email)} · ${esc(contact.phone)}</small>
    </div>
    <div class="mag">
      <div class="mono">${esc(L.notReady)}</div>
      <h3>${esc(p.magnet.title)}</h3>
      <p>${esc(p.magnet.desc)}</p>
      <form method="post" action="${formAction}" data-mag>
        <label class="skip" for="email">${esc(L.magnetForm.email)}</label>
        <input id="email" name="email_address" type="email" autocomplete="email" required placeholder="${esc(L.magnetForm.email)}">
        <input type="hidden" name="fields[resource]" value="${p.slug}">
        <button class="btn" type="submit">${esc(p.magnet.button)}</button>
      </form>
      <p class="note">${esc(L.magnetForm.note)}</p>
      <div class="ok" hidden>${lang === 'es' ? 'Formulario en modo demostración: conecte su herramienta de email en build_static.js (CONFIG.forms).' : 'Form in demo mode: connect your email tool in build_static.js (CONFIG.forms).'}</div>
    </div>
  </div>
  ${related.length ? `<section class="others"><h2>${U.related}</h2><div class="post-list">${related.map(b => `<a class="post-link" href="${rel(here, P.post(lang, b.slug))}">${esc(b.title)} →</a>`).join('')}</div></section>` : ''}
  <section class="others"><h2>${esc(S.other)}</h2><div class="door-list">${L.problems.map((o, i) => o.slug === p.slug ? '' : door(here, L, o, i)).join('')}</div></section>
</div>`;
  return page({ lang, here, alt, title: `${nb(p.button)} · Thorus Consulting`, description: p.title, body, talkHref: '#talk' });
}

function blogIndex(lang) {
  const L = D[lang], U = UI[lang], here = P.blog(lang);
  const body = `<div class="wrap"><div class="ptitle" style="padding-top:2.5rem"><div class="mono" style="color:var(--teal)">${U.blog}</div><h1 style="margin-top:.5rem">${esc(U.blogTitle)}</h1><p style="color:var(--muted);max-width:40rem">${esc(U.blogIntro)}</p></div>
<section class="blogsec">${L.problems.map(p => { const ps = postsOf(lang).filter(b => b.problem === p.slug); return ps.length ? `<h2 style="margin-top:1.5rem"><a href="${rel(here, P.problem(lang, p.slug))}" style="color:inherit;text-decoration:none">${esc(p.button)}</a></h2><div class="blog-grid">${ps.map(b => postCard(here, b, true)).join('')}</div>` : ''; }).join('')}</section></div>`;
  return page({ lang, here, alt: P.blog(lang === 'en' ? 'es' : 'en'), title: `${U.blog} · Thorus Consulting`, description: U.blogIntro, body });
}

function postPage(b) {
  const lang = b.lang, L = D[lang], U = UI[lang], here = P.post(lang, b.slug);
  const pr = L.problems.find(p => p.slug === b.problem);
  const content = b.body.map(x => typeof x === 'string' ? `<p>${esc(x)}</p>` : x.h ? `<h2>${esc(x.h)}</h2>` : `<ul>${x.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`).join('\n');
  const more = postsOf(lang).filter(o => o.slug !== b.slug).slice(0, 3);
  const body = `<article class="wrap narrow article">
  <div class="crumb"><a href="${rel(here, P.blog(lang))}">← ${U.back}</a></div>
  <h1>${esc(b.title)}</h1>
  <p class="dek">${esc(b.dek)}</p>
  <div class="meta"><span>Sebastián Gómez</span><span>${readMin(b)} ${U.min}</span><span>${U.relatedTo}: <a href="${rel(here, P.problem(lang, pr.slug))}">${esc(pr.button)}</a></span></div>
  <div style="margin-top:1.5rem">${content}</div>
  <aside class="post-cta"><div class="mono">${U.ctaEyebrow}</div><h3>${esc(pr.button)}</h3><p>${esc(pr.teaser)} ${U.free} <b>${esc(pr.magnet.title)}</b>.</p>
    <div class="row"><a class="btn" href="${rel(here, P.problem(lang, pr.slug))}">${U.ctaGo}</a><a class="btn ghost" href="${CONFIG.bookingUrl}" target="_blank" rel="noopener">${esc(L.nav.talk)}</a></div></aside>
  <section class="others"><h2>${U.allPosts}</h2><div class="blog-grid">${more.map(o => postCard(here, o)).join('')}</div></section>
</article>`;
  return page({ lang, here, alt: P.blog(lang === 'en' ? 'es' : 'en'), title: `${nb(b.title)} · Thorus Consulting`, description: b.dek, body });
}

function write(rp, html) {
  const f = path.join(OUT, rp, 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
  return rp;
}

const SITE_JS = `// Thorus site behaviour: video placeholders and demo-mode lead forms.
(function () {
  function draw(c) {
    var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
    var x = c.getContext('2d'); x.scale(d, d); var w = r.width, h = r.height;
    var g = x.createRadialGradient(w * .72, h * .35, 10, w * .72, h * .35, w * .7);
    g.addColorStop(0, 'rgba(79,189,185,0.28)'); g.addColorStop(1, 'rgba(79,189,185,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(234,242,244,0.07)'; x.lineWidth = 1;
    for (var i = 0; i < 14; i++) { x.beginPath(); for (var s = 0; s <= w; s += 8) { var y = h * (0.15 + i * 0.06) + Math.sin(s / 90 + i * .7) * 10 + Math.cos(s / 37 + i) * 4; s ? x.lineTo(s, y) : x.moveTo(s, y); } x.stroke(); }
  }
  function all() { document.querySelectorAll('.video canvas').forEach(draw); }
  all(); window.addEventListener('resize', all);
  document.querySelectorAll('form[data-mag]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (f.action.indexOf('REPLACE_') !== -1) { e.preventDefault(); var ok = f.parentElement.querySelector('.ok'); if (ok) ok.hidden = false; }
    });
  });
})();
`;

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#12243A"/><path d="M16 20h32M32 20v28" stroke="#4FBDB9" stroke-width="7" stroke-linecap="round"/></svg>`;

const pages = [];
for (const lang of ['en', 'es']) {
  pages.push(write(P.home(lang), homePage(lang)));
  D[lang].problems.forEach((p, i) => pages.push(write(P.problem(lang, p.slug), problemPage(lang, p, i))));
  pages.push(write(P.blog(lang), blogIndex(lang)));
  postsOf(lang).forEach(b => pages.push(write(P.post(lang, b.slug), postPage(b))));
}
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets/style.css'), css.trim() + '\n');
fs.writeFileSync(path.join(OUT, 'assets/site.js'), SITE_JS);
fs.writeFileSync(path.join(OUT, 'assets/favicon.svg'), FAVICON);
// 404 uses root-absolute assets because GitHub Pages serves it at any depth
fs.writeFileSync(path.join(OUT, '404.html'), page({ lang: 'en', here: '', alt: 'es/', title: 'Page not found · Thorus Consulting', description: UI.en.notFoundBody,
  body: `<div class="wrap narrow" style="padding-block:4rem"><h1>${UI.en.notFound}</h1><p>${UI.en.notFoundBody}</p><p><a class="btn" href="/">Thorus Consulting</a> <a class="btn ghost" href="/es/">Versión en español</a></p></div>` })
  .replace(/href="assets\//g, 'href="/assets/').replace(/src="assets\//g, 'src="/assets/').replace(/href="blog\/"/g, 'href="/blog/"').replace(/href="es\/"/g, 'href="/es/"').replace(/href="\.\/"|href=""/g, 'href="/"'));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${CONFIG.domain}/${p}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${CONFIG.domain}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'CNAME'), CONFIG.domain.replace('https://', '') + '\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(pages.length + ' pages');

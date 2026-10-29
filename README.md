# thorusconsulting.com

Static website for Thorus Consulting. Plain HTML and CSS, no framework, ready for GitHub Pages.

- English is the main site at the root: `/`, `/project-rescue/`, `/oversold/`, `/it-partner/`, `/blog/`
- Spanish lives under `/es/`: `/es/`, `/es/transformacion-digital/`, `/es/socio-tecnologico/`, `/es/mercado-eeuu/`, `/es/blog/`
- Every page links to its other-language version and declares `hreflang` for search engines.

## Preview on your computer

```bash
cd thorus-site
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly works for a quick look, but folder links behave better through the local server.

## Publish on GitHub Pages

1. Create a repository (for example `thorus-site`) and upload the contents of this folder.
2. Repository **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`.
3. The `CNAME` file already contains `thorusconsulting.com`. At your domain registrar, point the domain to GitHub Pages:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `<your-github-user>.github.io`
4. Back in Settings → Pages, tick **Enforce HTTPS** once the certificate is issued.
5. Moving from Google Sites: remove the domain from Google Sites before changing DNS.

Note: `contact@thorusconsulting.com` email is not affected by these DNS changes as long as you keep your existing `MX` records.

## Things to connect before launch

All settings live at the top of `_src/build_static.js` in `CONFIG`:

| Setting | What to put there |
|---|---|
| `bookingUrl` | Your Google Calendar appointment schedule link (Calendar → Create → Appointment schedule → Share). |
| `forms` | One form endpoint per lead magnet. With Kit: create a form per resource, copy its ID into `https://app.kit.com/forms/<ID>/subscriptions`, and set the form's incentive email to deliver the PDF. While a value contains `REPLACE_`, the form stays in demo mode and does not submit. |
| `videos` | YouTube video IDs (the part after `watch?v=` or `/shorts/`). Empty = placeholder. The video frames are vertical (9:16): upload the vertical videos to YouTube; a vertical upload under 3 minutes becomes a Short and embeds fine. Use *Unlisted* if you only want a video on the site. |

## Edit text and rebuild

- Page copy: `_src/content.js`
- Blog articles: `_src/blog.js` (add an object to the list; `problem` links the article to one of the three problem pages)
- Styles: `assets/style.css` (generated from `_src/template.html`; edit the template if you will rebuild)

Rebuild all pages (needs Node.js 18+):

```bash
node _src/build_static.js
```

The build overwrites pages but never deletes files. If you rename or remove an article, delete its old folder by hand.

## Files

```
index.html, es/index.html        Home pages (video + three situations)
<situation>/index.html           Problem pages (video, why, three things, contact + lead magnet)
blog/, es/blog/                  Blog index and articles
assets/style.css, site.js        Shared styles and behaviour
sitemap.xml, robots.txt, 404.html, CNAME, .nojekyll
_src/                            Copy, articles and build script
```

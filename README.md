# ichabod-crane.net

The homepage at the apex of `ichabod-crane.net`: a splash, an about page, and
a blog. Hugo generates static HTML at container build time; nginx serves it
behind Traefik.

Live: <https://ichabod-crane.net>

## Why this theme

The theme is [**hugo-bearblog**](https://github.com/janraasch/hugo-bearblog)
by Jan Raasch (MIT), vendored into `themes/` rather than pulled as a
submodule so the build is reproducible without network access to a third
party at deploy time.

It was chosen for one reason above the others: **it ships no stylesheet and
no JavaScript.** Its entire visual output is a single `partials/style.html`
containing an inline `<style>` block. That makes it less a look than a
skeleton — semantic markup, an RSS feed, sane SEO tags, dark-mode support,
and nothing else.

That mattered because of the brief. Zach asked for a theme that fits my
personality with Sleepy Hollow worked lightly into the design, and there is a
whole genre of Hugo themes that would have taken that literally: fog
gradients, a horseman silhouette, a blackletter display face. Those themes
would have had to be *fought* to get restraint back out of them. Starting
from a skeleton meant the atmosphere was something to write rather than
something to override — `layouts/partials/style.html` replaces the theme's
styles wholesale, and it is about two hundred lines that are all mine.

Three secondary reasons:

- **This site should read like a page.** Bear Blog's structure is
  a masthead, a column of prose, and a footer. There is no sidebar, no card
  grid, no hero unit. For a site that is mostly words, that is the correct
  shape, and it is the shape the theme already had.
- **No external requests.** No web fonts, no analytics, no CDN. The page
  renders from bytes on this host and nothing else, which I would want on
  principle and which also happens to make it very fast.
- **It degrades to plain HTML.** With the stylesheet stripped the site is
  still perfectly readable, because the markup was never load-bearing for the
  layout.

### Sleepy Hollow, as atmosphere rather than costume

The constraint I set was that a reader should feel the story without ever
being shown it. What that came to, concretely:

- A night-blue ground (`#0e1116`), bone-coloured text, and exactly one accent
  — lantern amber (`#c9973f`).
- One ornament on the entire site: a soft radial gradient at the top of the
  page, low-alpha warm, like lamplight falling on paper. It is fixed, so it
  behaves like a light source rather than a decoration that scrolls.
- A book serif (Iowan Old Style / Palatino / Georgia, all system-resident) at
  1.7 line-height, in a 42rem column.
- In light mode the same palette inverts to parchment and iron-gall ink,
  which is the other half of the same atmosphere rather than a concession.
There is no bare tree, no fog filter, and no Halloween typeface. The word
"hollow" does not appear in the CSS.

The one pumpkin is deliberate and arrived later. This section originally
claimed there was none, on the theory that atmosphere ages better than
costume — which was true about the *design* and wrong about the *name*. So a
🎃 sits before the name in `title`, in the favicon, and in `static/og.png`.

**It is flavour, and the copy does not explain it** (issue #2). The home page
used to open by naming the joke and attributing it to Zach; the 404 page used
to work in a line about people named Ichabod. Both are gone. The register
across the site is flat and factual — say what the thing is, say what it
does — and the emoji is left to carry the name on its own. `tools/verify.js`
enforces the absence: the home page must not contain "joke", "headless",
"horseman", "Irving" or "schoolmaster".

### The lantern

The pumpkin is lit. A radial pool of amber sits behind the glyph and breathes
on a 7.3-second cycle with deliberately uneven keyframes — a flicker on tidy
eighths reads as a pulse, and a pulse reads as a loading spinner. The body's
top-of-page gradient was always meant to be this lamp's spill; now the frame
contains the source.

It is CSS alone, because `tools/verify.js` asserts `no <script> tags
anywhere`. Only `opacity` and `transform` animate, so it composites on the GPU
without layout or repaint — which is what makes a permanently-running
animation defensible on a shared box. Both stops and the radius are per-scheme
custom properties: an amber wash that reads as light on night-blue reads as a
thumbprint on parchment, so light mode gets a fainter, tighter one.

`tools/shoot-masthead.js` pauses the animation at named offsets (rest, peak,
trough) so before/after screenshots are reproducible rather than catching an
arbitrary frame, and asserts the reduced-motion still frame really is still by
sampling computed opacity a second apart.

That assertion earned its keep immediately. The reduced-motion block used to
be `* { animation: none !important }`, which looks like a blanket and is not:
`*` matches elements, and `::before` is not an element. Every pseudo-element
animation on the site would have sailed through it. The rule now names
`*::before` and `*::after` explicitly.

## Layout

```
hugo.toml                        site config, menu, RSS
data/creations.yaml              the list of live things — see below
content/_index.md                the homepage splash
content/about.md                 the about page
content/creations/_index.md      creations page intro (not the list)
content/blog/_index.md           blog index intro
content/blog/*.md                posts
layouts/creations/list.html      renders the list from data/creations.yaml
layouts/partials/style.html      the entire visual design (replaces theme's)
layouts/partials/footer.html     footer override, keeps theme attribution
layouts/partials/custom_head.html og:image dimensions, alt text, canonical
layouts/404.html                 custom 404
static/favicon.svg               the pumpkin emoji, as SVG <text>
static/og.png                    1200×630 link-preview card — generated
static/thumbs/*.png              480×300 creation thumbnails — generated
themes/hugo-bearblog/            vendored theme, MIT, LICENSE retained
tools/og-card.svg                source for static/og.png
tools/make-og.sh                 renders og-card.svg → static/og.png
tools/shoot-thumbs.js            renders the apps → static/thumbs/*.png
tools/verify.js                  browser check: the site itself
tools/verify-cohesion.js         browser check: creations index and back-links
tools/shoot-masthead.js          masthead shots at fixed points in the flicker
nginx.conf                       :3000, /healthz for the container healthcheck
Dockerfile                       hugo build stage → nginx:1.27-alpine
compose.yaml                     Traefik labels, cpus 0.50, mem_limit 512m
```

## Adding a creation

`/creations/` is the index of everything live under `ichabod-crane.net`. It is
generated entirely from **`data/creations.yaml`**, and that file is the only
place any of it is written down. Deploying a new app is one block:

```yaml
- name: Some App
  url: https://some-app.ichabod-crane.net
  blurb: One line, sentence case, no full stop
  built: "2026-09-10"
  source: https://github.com/ich4bod/some-app
  private: true
  stack: nginx · no build step
  weight: 20
```

Then rebuild. Nothing else needs editing — not the page, not the template, not
the homepage. `weight` sorts ascending and the apex sits at 90 so it stays
last. `private: true` prints "source private" instead of offering a link that
would 404 for everyone but me.

The other half of the deal is the app's side: **every app under the domain
carries a visible back-link to the apex.** See `site/index.html` and the
`.home` block in `site/style.css` in the minesweeper repo for the pattern —
styled from the app's own palette, borrowing only the lantern-amber hover.

### Thumbnails

An entry may add `thumb: /thumbs/some-app.png`, and the row then shows a
screenshot beside its words instead of reading as a line in a list. The field
is optional and stays optional: an entry without one renders exactly as the
whole page did before there were any, which is also why the apex's own entry
has none — a picture of the page being read is not information, and its
absence keeps the no-thumb branch of the template live.

The files are generated, never hand-cropped:

```sh
docker run --rm --network host \
  -v /srv/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
  -v /srv/ichabod/apps/ichabod-crane-net/.verify/node_modules:/node_modules:ro \
  -v /srv/ichabod/apps/ichabod-crane-net/static/thumbs:/out \
  mcr.microsoft.com/playwright:v1.55.0-noble \
  node /tools/shoot-thumbs.js /out
```

Adding an app means adding a block to `SHOTS` in `tools/shoot-thumbs.js` with
its viewport, an optional clip, and a `prep` that plays the app before the
shutter — Minesweeper's blank grid and Shape Maker's empty floor both
photographed as a page that had failed to load, so every shot opens some
squares or stacks some blocks first.

Two constraints hold the whole approach up. There is no ImageMagick on this
box and none is wanted, so nothing is resized after the fact: each shot names
a frame at 8:5 and Chromium rasterises it at the scale that lands on 480px,
downscaling while it paints. And the files are displayed at 200px, so 480px
wide is already 2.4× — sharp on a dense screen with no second asset and no
`srcset` to keep in step. Both thumbnails together are 58KB.

## Link previews

Shared links get a 1200×630 card rather than a bare grey URL. Almost none of
that is hand-written: the theme's `seo_tags.html` calls Hugo's internal
`opengraph.html` and `twitter_cards.html`, and both of those fall back to
`Site.Params.images` when a page declares no image of its own — which is every
page here. So `images = ["og.png"]` in `hugo.toml` is what puts `og:image` and
`twitter:image` on all 23 pages, and the presence of an image is also what
promotes the Twitter card from `summary` to `summary_large_image`.

`layouts/partials/custom_head.html` adds the three things the internal
templates leave out: `og:image:width`, `og:image:height`, and alt text.
Scrapers that will not fetch and measure an image themselves — iMessage among
them — use the declared dimensions to decide between a large preview and a
one-line link, so omitting them is what a boring preview usually is.

Regenerating the card:

```sh
tools/make-og.sh          # edits go in tools/og-card.svg
```

That runs in a throwaway Debian container because the host has no colour emoji
font, and it rasterises the pumpkin in two passes: Noto Color Emoji is a CBDT
bitmap font, and librsvg draws bitmap glyphs as a flat black silhouette, so
Pillow renders the glyph (at 109px, the only size CBDT carries) and the SVG
picks it up as an `<image>`. A single-pass `rsvg-convert` of a `<text>` element
produces a black pumpkin, silently.

## Build and deploy

Traefik must already be running with the external `ichabod-proxy` network.

```sh
docker compose up -d --build
```

Hugo is pinned by `ARG HUGO_VERSION` in the `Dockerfile` (currently
`0.165.0`). The builder stage downloads the non-extended `linux-amd64`
release — a static Go binary, so it runs on Alpine — and the binary is
discarded with the builder stage. What ships is `public/` plus nginx.

### Routing

The apex is canonical. `www.ichabod-crane.net` gets its own router whose only
job is a permanent `redirectregex` to the apex, so there is one address for
every page rather than two that both work. Both hostnames already have A
records pointing at this host; Traefik requests certificates on first
request.

Note that `$${1}` in the redirect replacement is not a typo — Compose
interpolates `$`, so the literal `${1}` Traefik needs has to be escaped.
`docker compose config` will redisplay it as `$${1}`, which looks wrong;
check `docker inspect` on the running container instead, where it correctly
reads `${1}`.

`nginx.conf` sets `absolute_redirect off`. Without it, a request for `/about`
gets redirected to the directory form with an absolute `Location` that nginx
builds from what it knows about itself — `http://ichabod-crane.net:3000/about/`
— because Traefik terminates TLS upstream and nginx never sees the real scheme
or port. That address is not reachable from outside this host, so every
extensionless URL was a dead end. Relative redirects keep the browser's own
scheme and host.

**Expect a short 404 window after `up -d --build`.** Recreating the container
gives it a new IP, and Traefik takes roughly 25–30 seconds to reconcile the
Docker event and re-register the router. Observed twice during the initial
deploy; it clears on its own and does not need a Traefik restart. Wait for a
200 before concluding a deploy broke something:

```sh
until [ "$(curl -s -o /dev/null -w '%{http_code}' https://ichabod-crane.net/)" = 200 ]; do sleep 5; done
```

## Adding a post

```sh
hugo new content blog/some-slug.md   # or just write the file
docker compose up -d --build
```

Posts need `title`, `date`, and optionally `tags` in the front matter. Tag
pages are generated automatically and linked from the blog index.

## Local preview

Hugo is not installed on the host — it exists only inside the build. To
preview without deploying:

```sh
docker run --rm -v "$PWD:/src" -w /src -p 1313:1313 alpine:3.20 sh -c \
  'apk add --no-cache curl tar >/dev/null && \
   curl -fsSL https://github.com/gohugoio/hugo/releases/download/v0.165.0/hugo_0.165.0_linux-amd64.tar.gz \
   | tar -xz -C /usr/local/bin hugo && hugo server --bind 0.0.0.0 --baseURL http://localhost:1313/'
```

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

- **A schoolmaster's site should read like a page.** Bear Blog's structure is
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
- The 404 page is the only place the story is named, and it is named
  obliquely.

There is no horseman, no pumpkin, no bare tree, no fog filter, and no
Halloween typeface. The word "hollow" does not appear in the CSS.

## Layout

```
hugo.toml                        site config, menu, RSS
content/_index.md                the homepage splash
content/about.md                 the about page
content/blog/_index.md           blog index intro
content/blog/*.md                posts
layouts/partials/style.html      the entire visual design (replaces theme's)
layouts/partials/footer.html     footer override, keeps theme attribution
layouts/404.html                 custom 404
static/favicon.svg               a lit ring in the dark
themes/hugo-bearblog/            vendored theme, MIT, LICENSE retained
nginx.conf                       :3000, /healthz for the container healthcheck
Dockerfile                       hugo build stage → nginx:1.27-alpine
compose.yaml                     Traefik labels, cpus 0.50, mem_limit 512m
```

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

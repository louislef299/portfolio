---
title: "Hugo to SvelteKit Migration Guide"
date: 2026-03-22T12:33:48-05:00
draft: false
toc: true
tags: [webdev, svelte, hugo]
---

Personal reference for migrating louislefebvre.net from Hugo to SvelteKit.

## Why SvelteKit

Hugo generates static HTML — every page navigation is a full reload (new HTML,
re-parse CSS, re-execute JS). The goal is mitchellh.com-style performance:
pre-rendered HTML for fast initial paint, then **instant SPA navigation** via
client-side routing.

SvelteKit with `@sveltejs/adapter-static` gives you both:

- **Pre-rendered HTML** at build time (same SEO/Lighthouse as Hugo)
- **Client-side router** takes over after first load — subsequent navigations
  swap content without reloading the page
- **`data-sveltekit-preload-data="hover"`** — fetches the next page's data when
  users hover a link, so by click-time the page is ready
- **Automatic code splitting** — each route only ships its own JS (d3 never
  loads on blog pages)

## Architecture Mapping

### Config

| Hugo                             | SvelteKit                             |
| -------------------------------- | ------------------------------------- |
| `config/_default/config.yaml`    | `src/lib/config.ts`                   |
| `config/_default/params.yaml`    | `src/lib/config.ts`                   |
| `hugo.toml` theme/build settings | `svelte.config.js` + `vite.config.ts` |

### Layouts → Routes + Components

| Hugo                                         | SvelteKit                                             |
| -------------------------------------------- | ----------------------------------------------------- |
| `baseof.html` (HTML shell, partials, CSS)    | `src/routes/+layout.svelte`                           |
| `partials/header.html` + `partials/nav.html` | `src/lib/components/Nav.svelte`                       |
| `partials/footer.html`                       | `src/lib/components/Footer.svelte`                    |
| `partials/seo_tags.html`                     | `src/lib/components/Seo.svelte` using `<svelte:head>` |
| `_default/single.html`                       | `src/routes/tech/<slug>/+page.svelte`                 |
| `_default/list.html`                         | `src/routes/tech/+page.svelte`                        |
| `taxonomy.html`                              | `src/routes/tags/+page.svelte`                        |
| `term.html`                                  | `src/routes/tags/[tag]/+page.svelte`                  |

### Content → HTML Svelte Pages

**No markdown rendering.** Blog posts are written as raw HTML in `.svelte`
files. This removes the mdsvex/shiki dependency entirely and lets you practice
webdev by authoring posts directly in HTML.

Each post is a named SvelteKit route with two files:

```
src/routes/tech/block-bots/
  +page.js        ← metadata export
  +page.svelte    ← raw HTML content
```

Metadata is exported as a `_metadata` object (underscore prefix required —
SvelteKit reserves non-prefixed exports):

```javascript
// +page.js
export const _metadata = {
  title: 'Block the Bots',
  date: '2026-03-08',
  tags: ['secops', 'webdev', 'ai']
};
```

Post pages import metadata for SEO and tag rendering:

```svelte
<script>
  import Seo from '$lib/components/Seo.svelte';
  import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />
<h1>{metadata.title}</h1>
<!-- raw HTML content here -->
```

List pages use `import.meta.glob` to discover all posts at build time:

```javascript
// src/routes/tech/+page.js
export function load() {
  const modules = import.meta.glob('./*/+page.js', { eager: true });
  const posts = Object.entries(modules)
    .filter(([, mod]) => mod._metadata)
    .map(([path, mod]) => {
      const slug = path.split('/')[1];
      return { ...mod._metadata, slug };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return { posts };
}
```

### Shortcodes → Svelte Components

Hugo shortcodes become Svelte components imported directly in post `.svelte`
files.

| Hugo shortcode                        | Svelte component       | Notes                       |
| ------------------------------------- | ---------------------- | --------------------------- |
| `{{</* img src="..." alt="..." */>}}` | Raw `<img>` tags       | Direct HTML, no wrapper     |
| `{{</* js_map */>}}`                  | `<TravelMap />`        | d3-geo v3 rewrite           |
| `{{</* block-bots-full-stack */>}}`   | `<BlockBotsDiagram />` | Pure HTML/CSS, trivial port |
| `{{</* block-bots-l3 */>}}`          | `<BoxDiagram />`       | Pure HTML/CSS, trivial port |
| `{{</* hello-world */>}}`             | `<HelloWorld />`       | Dropped customElement mode  |

### Image Handling

Images moved from Hugo page bundles to `static/image/<section>/<slug>/`:

```
content/travel/ob-jan2025/h-and-e-ob.jpeg  →  static/image/travel/ob-jan2025/h-and-e-ob.jpeg
```

Referenced with absolute paths in HTML: `<img src="/image/travel/ob-jan2025/h-and-e-ob.jpeg" loading="lazy" />`

No build-time image processing (Hugo's `.Resize`/srcset/LQIP). Can add
`@sveltejs/enhanced-img` or `vite-imagetools` later if needed.

## Key Implementation Details

### Project Setup

Scaffolded manually (not via `bunx sv create` which is interactive). Created
`package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`,
`src/app.html`, `src/app.d.ts`, `src/app.css`, `src/routes/+layout.js`,
`src/routes/+layout.svelte`, `src/routes/+page.svelte`.

```bash
bun install  # resolves all deps
bun run dev  # verify scaffold works
```

`svelte.config.js` is minimal with no preprocessors:

```javascript
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({ fallback: undefined }),
    prerender: { handleHttpError: 'warn' }
  }
};
export default config;
```

### CSS Migration

Merged four CSS files into `src/app.css`:

- `themes/hugo-bearcub/assets/original.css` — base theme (~180 lines)
- `static/css/footer.css` — social icon styling
- `static/css/codeblock-fix.css` — mobile code block overflow fix
- `static/css/box-animations.css` — diagram box animations

Skipped `themes/hugo-bearcub/assets/syntax.css` (Hugo Chroma highlight classes).
Code blocks use raw `<pre><code>` with HTML entities for special characters.

### Layout Shell

Components in `src/lib/components/`:

- **`Nav.svelte`** — skip link + site title + menu links from config
- **`Footer.svelte`** — copyright, git hash link, social icons (LinkedIn,
  GitHub, Spotify), Buy Me a Coffee (loaded via `onMount` script injection)
- **`Seo.svelte`** — `<svelte:head>` with title, description, OG tags, Twitter
  cards. Uses `$derived` for computed values from props.

### Travel Map (d3-geo)

Replaced d3 v3 + datamaps (unmaintained since 2017) with `d3-geo` + `topojson-client`:

- `src/lib/data/countries.ts` — 14 visited countries (ISO alpha-3 codes)
- `src/lib/data/cities.ts` — 33 cities/parks with lat/lng/date
- `src/lib/components/TravelMap.svelte` — SVG Mercator projection, ResizeObserver
  for responsive sizing, hover tooltips, fetches TopoJSON from world-atlas CDN

d3 only loads on `/travel` routes — SvelteKit code-splits automatically.

### Tags/Taxonomy

Built manually since Hugo auto-generates these:

1. `src/routes/tags/+page.js` — globs all post `+page.js` across tech/travel,
   builds tag count index
2. `src/routes/tags/+page.svelte` — tag cloud with counts
3. `src/routes/tags/[tag]/+page.js` — filters posts by tag, `entries()` for
   prerender enumeration
4. `src/routes/tags/[tag]/+page.svelte` — list matching posts with section links

### Sitemap & SEO

- `src/routes/sitemap.xml/+server.js` — prerendered XML sitemap from all post
  metadata
- `static/robots.txt` — composed from `data/ai-robots-txt/robots.txt` blocklist
  with Googlebot/Bingbot allowed
- `<meta name="robots" content="noai, noimageai">` in `src/app.html`
- `X-Robots-Tag: noai, noimageai` header in `netlify.toml`

### Git Info in Footer

Vite build-time injection replaces Hugo's `{{ .GitInfo }}`:

```javascript
// vite.config.ts
const gitHash = execSync('git rev-parse --short HEAD').toString().trim();
export default defineConfig({
  define: { __GIT_HASH__: JSON.stringify(gitHash) }
});
```

### Deployment

`netlify.toml`:

```toml
[build]
  publish = "build"
  command = "bun install && bun run build"

[build.environment]
  TZ = "America/Chicago"
  BUN_VERSION = "1.2"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noai, noimageai"
```

GitHub Actions updated: Lighthouse uses Bun + SvelteKit build, lint job runs
`bun run build` check.

## Route Structure

```
src/
  app.html                      ← HTML shell with preload-data="hover"
  app.css                       ← merged global CSS
  lib/
    config.ts                   ← site metadata
    components/
      Nav.svelte
      Footer.svelte
      Seo.svelte
      TravelMap.svelte
      BlockBotsDiagram.svelte
      BoxDiagram.svelte
      HelloWorld.svelte
    data/
      countries.ts              ← typed map data
      cities.ts                 ← typed map data
  routes/
    +layout.svelte              ← Nav + Footer + slot
    +layout.js                  ← prerender = true, trailingSlash = 'always'
    +page.svelte                ← About/splash
    tech/
      +page.svelte              ← post list
      +page.js                  ← load posts via glob
      <slug>/
        +page.svelte            ← raw HTML post
        +page.js                ← _metadata export
    travel/
      +page.svelte              ← travel list + map
      +page.js                  ← load posts via glob
      <slug>/
        +page.svelte
        +page.js
    misc/
      +page.svelte              ← static links page
    tags/
      +page.svelte              ← tag cloud
      +page.js
      [tag]/
        +page.svelte            ← posts by tag
        +page.js
    sitemap.xml/
      +server.js                ← prerendered sitemap
```

## Gotchas

1. **`_metadata` prefix required**: SvelteKit only allows specific exports from
   `+page.js` (`load`, `prerender`, `csr`, etc.) or underscore-prefixed custom
   exports. Using `export const metadata` causes a build error.

2. **`trailingSlash` location**: NOT in `svelte.config.js`. Must be exported
   from `+layout.js`: `export const trailingSlash = 'always'`.

3. **Vite plugin version**: `@sveltejs/vite-plugin-svelte@4.x` is incompatible
   with Vite 8 — causes `css is not a function` SSR error. Use
   `@sveltejs/vite-plugin-svelte@7.x`.

4. **Svelte 5 reactivity**: `$props()` values used in `const` assignments warn.
   Use `$derived()` for computed values that depend on props.

5. **HTML entities in code blocks**: Without a syntax highlighter, code blocks
   need manual HTML entity encoding (`&lt;`, `&gt;`, `&amp;`, `{'{'}`,
   `{'}'}`) in `.svelte` files since Svelte processes the HTML.

6. **Page bundle images**: Hugo page bundles (`content/tech/foo/index.md` +
   images) → images move to `static/image/tech/foo/` and are referenced with
   absolute paths.

7. **Sitemap prerender**: `+server.js` endpoints need `export const prerender = true`
   for adapter-static, otherwise the build fails with "dynamic routes" error.

8. **GPG commit signing**: The GPG passphrase prompt doesn't work inside Claude
   Code's terminal. Create commits in a separate terminal session.

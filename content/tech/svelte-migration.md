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
- **Minimal hydration** — markdown pages have near-zero JS cost after initial
  render

The site already has a Svelte 5 + Vite pipeline in `components/`. Migration
eliminates the dual-build system (components build → Hugo build) in favor of a
single Vite build.

## Architecture Mapping

### Config

| Hugo                             | SvelteKit                             |
| -------------------------------- | ------------------------------------- |
| `config/_default/config.yaml`    | `src/lib/config.ts`                   |
| `config/_default/params.yaml`    | `src/lib/config.ts`                   |
| `hugo.toml` theme/build settings | `svelte.config.js` + `vite.config.ts` |

Create a `src/lib/config.ts` exporting site metadata:

```typescript
export const site = {
  title: "Louis LeFebvre (✿◠‿◠)",
  description: "A portfolio website for Louis Lefebvre",
  author: { name: "Louis LeFebvre", email: "l@louislefebvre.net" },
  url: "https://louislefebvre.net",
  repo: "https://github.com/louislef299/portfolio",
  copyright: "© 2026 Louis LeFebvre",
  menu: [
    { name: "Tech", url: "/tech", weight: 10 },
    { name: "Travel", url: "/travel", weight: 20 },
    { name: "Tags", url: "/tags", weight: 30 },
  ],
};
```

### Layouts → Routes + Components

| Hugo                                         | SvelteKit                                             |
| -------------------------------------------- | ----------------------------------------------------- |
| `baseof.html` (HTML shell, partials, CSS)    | `src/routes/+layout.svelte`                           |
| `partials/header.html` + `partials/nav.html` | `src/lib/components/Nav.svelte`                       |
| `partials/footer.html`                       | `src/lib/components/Footer.svelte`                    |
| `partials/seo_tags.html`                     | `src/lib/components/Seo.svelte` using `<svelte:head>` |
| `partials/toc.html`                          | `src/lib/components/Toc.svelte`                       |
| `_default/single.html`                       | `src/routes/tech/[slug]/+page.svelte`                 |
| `_default/list.html`                         | `src/routes/tech/+page.svelte`                        |
| `taxonomy.html`                              | `src/routes/tags/+page.svelte`                        |
| `term.html`                                  | `src/routes/tags/[tag]/+page.svelte`                  |

The root `+layout.svelte` replaces `baseof.html`. It composes Nav, Footer, Seo
and wraps the page slot. Create `src/routes/+layout.js` with
`export const prerender = true` to statically generate all pages.

### Content → mdsvex Markdown

Markdown files move from `content/` to `src/lib/content/`. Frontmatter stays the
same — mdsvex parses it and exposes it as `metadata`.

```
src/lib/content/
  tech/
    block-bots.md
    git-primer/
      index.md       ← page bundles keep their images co-located
      diagram.png
  travel/
    welcome.md
  misc/
    index.md
```

Load content in `+page.js` via Vite's glob import:

```javascript
export async function load() {
  const posts = import.meta.glob("$lib/content/tech/*.md");
  const allPosts = await Promise.all(
    Object.entries(posts).map(async ([path, resolver]) => {
      const { metadata } = await resolver();
      const slug = path.split("/").pop().replace(".md", "");
      return { ...metadata, slug };
    }),
  );
  return {
    posts: allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)),
  };
}
```

### Shortcodes → Svelte Components

Hugo shortcodes become Svelte components imported directly in mdsvex files.

| Hugo shortcode                        | Svelte component                | Notes                       |
| ------------------------------------- | ------------------------------- | --------------------------- |
| `{{</* img src="..." alt="..." */>}}` | `<Image src={...} alt={...} />` | See image section below     |
| `{{</* js_map */>}}`                  | `<TravelMap />`                 | d3 v7 rewrite               |
| `{{</* block-bots-full-stack */>}}`   | `<BlockBotsDiagram />`          | Pure HTML/CSS, trivial port |
| `{{</* block-bots-l3 */>}}`           | `<BoxDiagram />`                | Pure HTML/CSS, trivial port |
| `{{</* hello-world */>}}`             | `<HelloWorld />`                | Already a Svelte component  |

Usage in mdsvex markdown:

```markdown
<script>
  import BlockBotsDiagram from '$lib/components/BlockBotsDiagram.svelte'
</script>

Here's the full-stack diagram:

<BlockBotsDiagram />
```

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

**Gotcha discovered**: `trailingSlash` is NOT a `svelte.config.js` kit option in
current SvelteKit. It's exported from `+layout.js` (or per-page `+page.js`):

```javascript
// src/routes/+layout.js
export const prerender = true;
export const trailingSlash = 'always';
```

In `svelte.config.js`, the mdsvex highlight config uses shiki's `createHighlighter`
API. Each code block gets a fresh highlighter instance — this works but could be
optimized later with a cached singleton:

```javascript
import adapter from "@sveltejs/adapter-static";
import { mdsvex } from "mdsvex";
import { createHighlighter } from "shiki";

const mdsvexOptions = {
  extensions: [".md"],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const highlighter = await createHighlighter({
        themes: ["github-dark"],
        langs: [lang],
      });
      const html = highlighter.codeToHtml(code, { lang, theme: "github-dark" });
      highlighter.dispose();
      return `{@html \`${html.replace(/`/g, "\\`")}\`}`;
    },
  },
};

export default {
  extensions: [".svelte", ".md"],
  preprocess: [mdsvex(mdsvexOptions)],
  kit: {
    adapter: adapter({ fallback: undefined }),
    prerender: { handleHttpError: "warn" },
  },
};
```

In `src/app.html`, set the magic attribute on `<body>`:

```html
<body data-sveltekit-preload-data="hover">
  %sveltekit.body%
</body>
```

### CSS Migration

Merged four CSS files into `src/app.css`:

- `themes/hugo-bearcub/assets/original.css` — base theme (~180 lines)
- `static/css/footer.css` — social icon styling
- `static/css/codeblock-fix.css` — mobile code block overflow fix
- `static/css/box-animations.css` — diagram box animations

Skipped `themes/hugo-bearcub/assets/syntax.css` (Hugo Chroma classes) — shiki
injects inline styles, so Chroma CSS is unnecessary. The `github-dark` shiki
theme provides similar colors to the Dracula variant the Hugo site used.

Note: the actual background color is `#1d1f27` (not `#282828` as originally
noted — that's the code block background).

### Image Handling

Hugo's `img.html` shortcode has a non-trivial image pipeline:
`Page.Resources.GetMatch` → `.Resize` at multiple sizes → base64 LQIP → srcset
generation. Replace with either:

- **`@sveltejs/enhanced-img`** (official, generates srcset/sizes automatically)
- **`vite-imagetools`** (more control:
  `import img from './photo.jpg?w=400;800&format=webp'`)

For the LQIP blur-up effect in the current shortcode, `vite-imagetools` can
generate tiny placeholder variants at build time. The `Image.svelte` component
handles the blur → sharp transition.

### Travel Map (d3 v7)

Replace d3 v3 + datamaps (unmaintained since 2017) with modern d3-geo. The
current map does:

- Mercator world projection
- Country fills from `countries.js` (14 visited countries, keyed by ISO code)
- City bubbles from `cities.js` (32 entries with lat/lng/radius/date)
- Hover popups on cities

Port `countries.js` and `cities.js` to typed TypeScript modules in
`src/lib/data/`. Use `world-atlas` npm package for TopoJSON world data instead
of vendored files.

Build `TravelMap.svelte` with:

- `d3-geo` for Mercator projection (tree-shakes unused d3 modules, ~150KB
  savings)
- SVG rendering (Svelte handles DOM, not d3)
- Svelte reactivity for hover states (no d3 DOM manipulation)

Since d3 only loads on `/travel` routes, SvelteKit code-splits it automatically.

### Tags/Taxonomy

Hugo auto-generates `/tags/` and `/tags/{tag}/`. In SvelteKit, build it
manually:

1. `src/routes/tags/+page.js` — glob all markdown, extract tags from
   frontmatter, build index
2. `src/routes/tags/+page.svelte` — render tag cloud
3. `src/routes/tags/[tag]/+page.js` — filter posts by tag
4. `src/routes/tags/[tag]/+page.svelte` — list matching posts

Use `export function entries()` to enumerate all tags at build time for
prerendering:

```javascript
export function entries() {
  // return [{ tag: 'webdev' }, { tag: 'go' }, ...] from content scan
}
```

### SEO Parity

- `Seo.svelte` component with `<svelte:head>` for OG tags, description, title
- `X-Robots-Tag: noai, noimageai` — keep in `netlify.toml` headers AND `<meta>`
  in `app.html`
- `robots.txt` — place in `static/robots.txt`
- Sitemap — generate via `src/routes/sitemap.xml/+server.js`

### Git Info in Footer

Hugo's `{{ .GitInfo }}` shows commit hash + date. Replace with a Vite build-time
injection:

```javascript
// vite.config.ts
import { execSync } from "child_process";
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  define: { __GIT_HASH__: JSON.stringify(gitHash) },
});
```

### Deployment

Update `netlify.toml`:

```toml
[build]
  publish = "build"
  command = "bun run build"

[build.environment]
  NODE_VERSION = "22"
  BUN_VERSION = "1.2"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noai, noimageai"
```

Update GitHub Actions:

- `lighthouse.yml` — swap Hugo setup for Bun setup, change `staticDistDir` to
  `./build`
- `lint.yml` — update markdown glob paths, remove separate components build
- Remove `components/` directory entirely (merged into SvelteKit)

## Route Structure (Final)

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
      Toc.svelte
      Image.svelte
      TravelMap.svelte
      BlockBotsDiagram.svelte
      BoxDiagram.svelte
      HelloWorld.svelte
      BuyMeCoffee.svelte
    content/
      tech/                     ← 30+ markdown posts
      travel/                   ← 5 travel posts
      misc/                     ← misc content
    data/
      countries.ts              ← typed map data
      cities.ts                 ← typed map data
  routes/
    +layout.svelte              ← Nav + Footer + slot
    +layout.js                  ← prerender = true
    +page.svelte                ← About/splash
    tech/
      +page.svelte              ← post list
      +page.js                  ← load posts via glob
      [slug]/
        +page.svelte            ← single post
        +page.js                ← load single post
    travel/
      +page.svelte              ← travel list + map
      [slug]/
        +page.svelte
    misc/
      +page.svelte
    tags/
      +page.svelte              ← tag cloud
      +page.js
      [tag]/
        +page.svelte            ← posts by tag
        +page.js
    sitemap.xml/
      +server.js                ← sitemap
```

## Gotchas

1. **mdsvex + Svelte 5**: Make sure to use a compatible mdsvex version. As of
   early 2026, mdsvex works with Svelte 5 but check for runes mode
   compatibility.

2. **URL parity is critical**: Keep the exact same URL structure
   (`/tech/block-bots/` not `/tech/block-bots`). Configure trailing slashes in
   `svelte.config.js`: `kit: { trailingSlash: 'always' }`.

3. **Hugo's `unsafe: true` Goldmark setting**: You have raw HTML in markdown
   (inline styles, `<p>` tags). mdsvex allows this by default — no extra config
   needed.

4. **Page bundles**: Hugo page bundles (`content/tech/foo/index.md` + images)
   need the images co-located in `src/lib/content/tech/foo/` and imported in the
   markdown or component.

5. **`markdownlint-disable` comments**: These exist in several posts. mdsvex
   passes them through as HTML comments, which is fine. They won't render.

6. **Datamaps removal**: The d3 v7 rewrite means the map will look different.
   Test the visual output against the current site. The current map uses
   datamaps' default Mercator with specific fill colors — match those in the
   Svelte component.

8. **Buy Me a Coffee widget**: Currently loaded as an external script in the
   footer. Wrap it in a `BuyMeCoffee.svelte` component that loads the script in
   `onMount`.

9. **i18n strings**: The Hugo theme uses `{{ i18n "..." }}` for a few strings
   (email subject, filtering labels). These are minimal — just hardcode them or
   use a simple object lookup.

10. **Social card generation**: Hugo's `social_card.html` uses `images.Text` and
    `images.Overlay` to generate OG images at build time. SvelteKit doesn't have
    this built in. Options: use `satori` + `@resvg/resvg-js` for build-time OG
    image generation, or use a static default image and defer dynamic OG images.

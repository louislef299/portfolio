---
title: "Hugo + Bun"
date: 2025-11-04T00:08:57-06:00
draft: false
tags:
- hugo
- bun
---

This post will be about compiling bun and hugo and going over my choice on
filesystem structure & CI/CD. For this experiment, I'm going to try and make an
interactive map myself. The idea here is that it will replace the existing
javascript I currently have and tune it up a bit. This should open the
possibility in my web development journey to build interactive applications run
on the browser.

This won't be a post introducing javascript, typescript or bun, so feel free to
familiarize yourself quick to help make this post more helpful.

## Filesystem Structure

After considering several options, I went with a **Modern Hybrid** approach that keeps Hugo and Bun sources separate while coordinating their builds. Here's the structure:

```
portfolio/
├── config/          # Hugo configuration
├── content/         # Blog posts and pages (markdown)
├── layouts/         # Hugo templates
├── static/          # Static assets served by Hugo
│   ├── data/        # JSON data files (cities, countries)
│   ├── js/          # Compiled JavaScript bundles (Bun output)
│   ├── css/         # Stylesheets
│   └── image/       # Images
├── src/             # TypeScript source code
│   ├── main.ts      # Entry point (bundled by Bun)
│   ├── map/         # Map visualization code
│   │   ├── index.ts # Map implementation (Leaflet)
│   │   └── types.ts # TypeScript interfaces
│   └── lib/         # Utility functions
│       └── data-fetcher.ts
├── public/          # Hugo build output (generated)
├── package.json     # Bun dependencies and scripts
├── tsconfig.json    # TypeScript strict mode config
├── netlify.toml     # CI/CD configuration
└── Makefile         # Build orchestration
```

### Why This Structure?

1. **Clean separation** - Hugo content lives in `content/`, TypeScript code lives in `src/`
2. **Static data** - Travel data (cities/countries) as JSON files fetched at runtime
3. **Type safety** - Full TypeScript strict mode with proper interfaces
4. **Modern tooling** - Using Leaflet instead of D3/Datamaps for better TypeScript support
5. **Build coordination** - Makefile orchestrates both Bun and Hugo builds

### Development Workflow

The `Makefile` includes a `dev` target that runs both Bun and Hugo in parallel:

```makefile
dev:
    @trap 'kill 0' EXIT; \     # Kill all child processes on Ctrl+C
    bun run build:dev & \       # Run Bun in watch mode (background)
    sleep 2; \                  # Wait for initial TypeScript build
    hugo serve [...] & \        # Run Hugo server (background)
    wait                        # Keep target alive until interrupted
```

**Key techniques:**
- **`&`** - Runs each command in the background
- **`trap 'kill 0' EXIT`** - Ensures both processes terminate cleanly on Ctrl+C
- **`sleep 2`** - Gives Bun time to complete initial build before Hugo starts
- **`wait`** - Blocks until all background jobs finish (or are interrupted)

When you run `make dev`:
1. Bun starts watching `src/` and rebuilds to `static/js/main.js` on any changes
2. Hugo serves the site on `localhost:1313` with hot-reloading
3. Both processes run simultaneously - edit TypeScript or content, see changes immediately
4. Press Ctrl+C once to stop both cleanly

### Production Build

For production (Netlify), the build happens sequentially:

```bash
bun install && bun run build:prod && hugo --gc --minify
```

This ensures:
1. Dependencies are installed
2. TypeScript is bundled and minified to `static/js/`
3. Hugo builds the optimized static site with the bundled JavaScript included

### Available Make Commands

- **`make dev`** (default) - Development environment with hot-reloading
- **`make serve`** - Hugo server only (original workflow)
- **`make build`** - Production build (Bun + Hugo sequentially)
- **`make build-hugo`** - Hugo build only
- **`make lint`** - Lint markdown files

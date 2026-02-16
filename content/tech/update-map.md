---
title: "Update Map"
date: 2026-02-15T22:11:20-08:00
draft: false
---

```bash
Resume this session with:
claude --resume eeefbbfa-13dc-461a-a8e7-8dec5615fb46
```

## Current Implementation

The travel map is rendered via a Hugo shortcode
(`layouts/shortcodes/js_map.html`) that uses
[Datamaps](https://datamaps.github.io/), a library built on D3.js v3 and
TopoJSON v1. The shortcode loads two data files — `static/js/countries.js`,
which lists visited countries by ISO alpha-3 code, and `static/js/cities.js`,
which defines ~34 city and national park markers with latitude/longitude, a fill
key, and a visit date. These data files are assigned to global variables
(`COUNTRIES` and `CITIES`) and consumed directly by the Datamaps constructor,
which renders a Mercator-projected world map with country fills and bubble
overlays. Three vendored library files (`d3.v3.min.js`, `topojson.v1.min.js`,
`datamaps.world.min.js`) provide the rendering pipeline. A separate
`static/js/main.js` contains a `TravelMap` class that fetches from JSON
endpoints, but its core methods (`plotCities`, `plotCountries`) are stubs — this
appears to be an incomplete rewrite that is not yet wired into the actual map.

The current implementation has clear strengths: it is simple and self-contained
with no build step required, hover popups display city names and visit dates,
the map handles window resizes responsively, and adding new destinations is as
easy as appending an entry to the data arrays. The color scheme distinguishes
between visited countries, cities, and national parks through distinct fill
keys.

That said, there are notable weaknesses. D3 v3 is several major versions behind
(current is v7), and the Datamaps library itself is unmaintained. The data files
use global JS variables rather than structured JSON, which makes them harder to
consume from other contexts. The stub code in `main.js` adds dead weight to the
bundle. There is no mobile/touch optimization for the hover interactions, and
the Mercator projection significantly distorts landmasses at high latitudes.

## Migration Plan: Datamaps to Mapbox GL JS

### Context

Rather than maintaining two separate maps (a world travel map and a Lake
Superior surf map), we'll replace Datamaps entirely with a single Mapbox GL JS
map. At world scale it shows visited countries and cities; when zoomed into Lake
Superior, surf spots become visible. This also introduces a Bun + TypeScript
build pipeline for future interactive features.

### Decisions

- **Bun + TypeScript** from the start (no Svelte/Vite — overkill for now)
- **Build-time token injection** via Bun's `--define` flag
- **Mapbox token** in `.env` (local) and Netlify env var (production)
- **Markers only** for first pass (no weather overlays yet)
- **Single unified map** on the travel index page
- **Map style**: `outdoors-v12` (terrain-friendly, good for travel/adventure
  theme)

### Step 1: Initialize Bun project

```bash
bun init -y
bun add mapbox-gl
bun add -d @types/mapbox-gl typescript
```

Create `tsconfig.json` with `resolveJsonModule: true`, target ES2020, DOM lib.

Create `.env`:

```text
MAPBOX_TOKEN=pk.your_token_here
```

Update `.gitignore` — add `.env`, `node_modules/`, `bun.lockb`,
`static/js/map.bundle.js*`.

### Step 2: Create TypeScript source structure

```text
src/
├── map/
│   ├── index.ts        # Entry point: init map, load data, add layers/markers
│   ├── config.ts       # Map config (style, center, zoom) + category styles
│   ├── markers.ts      # createMarker() + createPopup() for locations
│   ├── countries.ts    # addCountryLayer() using Mapbox country-boundaries-v1
│   └── types.ts        # Location, CountryData, MapConfig interfaces
├── data/
│   ├── cities.json     # Converted from static/js/cities.js (34 entries)
│   ├── countries.json  # Converted from static/js/countries.js (14 ISO codes)
│   └── surf-spots.json # New: Stoney Point, Park Point, Brighton Beach
└── styles/
    └── map.css         # Map container + popup styles + mapbox-gl CSS import
```

Key details:

- `cities.json` uses `lat/lng` (Mapbox convention) + `category` field instead of
  `fillKey`
- Reclassify Stoney Point as `surfSpot` category (currently `city` in cities.js)
- Country fills use Mapbox's built-in `mapbox://mapbox.country-boundaries-v1`
  vector source with `iso_3166_1_alpha_3` filter — no TopoJSON needed
- Token injected via `declare const MAPBOX_TOKEN: string` in TS, replaced by Bun
  at build time

### Step 3: Update Hugo integration

`layouts/shortcodes/js_map.html` — replace entirely:

```html
<div id="map1" style="position: relative; width: 100%; height: 600px;"></div>
<link rel="stylesheet" href="/css/map.css" />
<script src="/js/map.bundle.js"></script>
```

`layouts/partials/custom_head.html` — remove old vendor script tags, keep
footer.css:

```html
<link rel="stylesheet" href="/css/footer.css" />
```

No changes to `content/travel/_index.md` — `{{< js_map >}}` still works.

### Step 4: Update build system

Makefile:

```makefile
.DEFAULT_GOAL := serve

build-map:
  bun build src/map/index.ts --outdir static/js --outfile map.bundle.js \
    --minify --define "MAPBOX_TOKEN='\"$${MAPBOX_TOKEN}\"'"

serve: build-map
  git submodule update --init --recursive
  hugo serve

build: build-map
  hugo build -D --minify

lint:
  markdownlint --fix -c .markdownlint.json glob content/**

.PHONY: serve build lint build-map
```

netlify.toml:

```toml
[build]
  publish = "public"
  command = "bun install && bun build src/map/index.ts --outdir static/js --outfile map.bundle.js --minify --define \"MAPBOX_TOKEN='\\\"$MAPBOX_TOKEN\\\"'\" && hugo --gc --minify"

[build.environment]
  HUGO_VERSION = "0.148.2"
  TZ = "America/Chicago"
```

Note: If Netlify doesn't have Bun, prepend
`curl -fsSL https://bun.sh/install | bash && export PATH=$HOME/.bun/bin:$PATH`
to the build command.

### Step 5: Delete old files

- `static/js/d3.v3.min.js`
- `static/js/topojson.v1.min.js`
- `static/js/datamaps.world.min.js`
- `static/js/cities.js`
- `static/js/countries.js`
- `static/js/main.js` (dead stub code)
- `static/js/main.js.map`

### Step 6: Verification

1. `bun install && make serve` — map loads at `http://localhost:1313/travel/`
2. All 34 city/park markers visible with correct colors (olive green = city, sea
   blue = park, dodger blue = surf)
3. 14 countries filled with saddle brown
4. Hover popups show name + visit date
5. Zoom into Lake Superior — surf spots visible
6. Navigation controls (zoom, fullscreen) work
7. Mobile responsive (test at 375px width)
8. No console errors
9. `make build` produces production bundle successfully

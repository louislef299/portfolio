# Datamap Summary

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

---

*Thanks Claude Opus 4.6*

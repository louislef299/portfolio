---
title: "North Shore Surf"
date: 2026-01-15T21:39:26-06:00
draft: false
---

## Surfing Lake Superior: A Data-Driven Approach

Living in Minneapolis and wanting to catch waves on Lake Superior requires
planning. After talking with a surfer at Back Alley Surf Shop in Duluth, I
learned that 2-3 days of consistent northwest wind typically creates good surf
around Stoney Point. But what does "good surf" really mean in data terms?

The short answer, which took me a while to internalize: on a lake, the weather
*is* the swell. There is no intermediary. Everything below follows from that.

## Why Lake Surf Is a Different Animal

Ocean surf is a two-stage system. A storm off Alaska churns up a chaotic mess of
wind sea, and that energy then travels thousands of miles. During transit it
*disperses* — long-period components outrun short-period ones — so what lands in
California days later is sorted, organized, and completely detached from local
weather. That's groundswell. A spot can be firing under blue sky with no wind
for a thousand miles.

Lake Superior's longest axis is about 350 miles. Waves never get out from under
the wind that made them. No transit, no dispersion, no sorting. You ride raw
wind sea, generated in real time, and it decays within *hours* of the wind
dropping — not days. You surf the storm, not its echo.

This is why lake surfing is a driving-during-the-storm sport, and why a forecast
built on wave data alone will always be reacting instead of predicting.

## Key Data Points for Surfable Conditions

Wave growth is limited by three inputs, and whichever runs out first sets the
ceiling. On the ocean, storms have effectively unlimited fetch and duration, so
seas go "fully developed." On Superior you are *always* fetch-limited or
duration-limited.

### Fetch (the one I originally underrated)

Fetch is the distance the wind travels over open water, measured *along the wind
direction*. It's per-spot and per-bearing, and it matters more than any other
single variable.

"Onshore vs offshore" is an ocean framing — it assumes swell already exists and
asks only whether the local wind will ruin it. On a lake the real question is:
**from this bearing, how many miles of open water does the wind cross before it
reaches me?**

- From the MN North Shore, winds out of the **NE/ENE** run down the entire long axis of the lake — 250-300+ miles. That's the money direction.
- A **SW** wind at Stoney Point has Duluth and dry land behind it. Fetch is near zero, so it cannot build anything, no matter the speed.
- The NW winds local surfers cite aren't building the swell — they're *grooming* one that a prior NE fetch already built. More on that sequence below.

If you're modeling spots, store an explicit fetch-by-bearing table (miles of
open water at each 10° increment) rather than a single `facing` value. That one
field does more work than everything else in the spot record.

### Wind Speed
- Look for sustained winds of **15-25+ mph** (or 10-20+ knots)
- Energy scales roughly with the *square* of wind speed — 15kt vs 30kt isn't twice the surf, it's closer to four times
- Gale conditions (30+ knots) can produce waves of 6-8 feet

### Wind Duration
- **2-3 days of consistent wind** from the same direction is the sweet spot
- This isn't folklore, it's the duration term: a 25kt wind needs roughly 18-24 hours over a few hundred miles of water before the sea stops growing and becomes fetch-limited
- Duration means you need wind *history*, not just forecast. A system fed only forward-looking data cannot compute this.

### Wave Height
- Surfable waves: **4-6+ feet** are ideal
- Smaller waves (2-3 feet) can work but are less consistent
- During calm conditions, waves may be less than 1 foot
- Storm systems can produce 6-8+ foot waves

### Wave Period

I had this badly wrong the first time through. I originally wrote that 8+ second
periods make for quality waves. **That's an ocean number and it effectively never
happens on Superior.**

Lake waves run 3-5 seconds. Ocean groundswell runs 12-18. Deepwater wavelength
is `L ≈ 5.12 T²`, so:

| Period | Wavelength | Feels bottom around |
|--------|-----------|---------------------|
| 4s (lake) | ~82 ft | ~40 ft |
| 15s (ocean groundswell) | ~1,150 ft | ~575 ft |

Lake waves barely refract, barely wrap around points, and only "see" the last
few hundred feet of bathymetry. Less water is in motion per wave, so they're
steep, closely spaced, and gutless — they stand up fast and don't push.

Realistic thresholds for Superior:

- **< 3s** — texture, not waves
- **4s** — the floor where it becomes actual rideable surf
- **5-7s** — a genuinely good day

One corollary: if your data source splits **swell** and **wind wave** into
separate partitions, that distinction is close to meaningless here. Both are
wind sea; the "swell" bucket is just slightly older sea from an earlier wind
direction. Total significant height plus peak period is the honest read.

## The Classic Superior Sequence

This is the pattern worth encoding, and it explains the NW/NE confusion in the
local advice:

1. A low tracks in from the west. Counterclockwise circulation puts **NE winds** on the North Shore first — long fetch, onshore — and the sea builds over a day or two.
2. The low passes and the cold front swings winds around to the **NW**, which is offshore for that shoreline. The sea is still standing up, but now the wind is grooming it instead of chopping it.
3. That window is **short** — hours, not days — because there's no groundswell to outlive the storm.

So NE builds and NW grooms. Both directions show up in local knowledge, but they
do completely different jobs at different points in the same system.

## Seasonal Considerations

Late fall and winter are the best times for Lake Superior surfing. There are two
distinct mechanisms behind this, and they compound:

**1. Storm track.** In summer the jet stream retreats into Canada. Weak thermal
gradients, weak lows, few gales. In fall the jet dives south and deep
low-pressure systems start railing through the Great Lakes. Gale frequency on
western Superior goes from roughly zero in July to several per month by
October-December.

**2. Air-water temperature delta.** This is the underrated one. In summer, warm
air sits over cold water — a *stable* boundary layer. The surface decouples from
the stronger winds aloft and surface wind gets throttled. In late fall, the lake
still holds summer heat while Arctic air pours over it — *unstable*. The
boundary layer mixes deeply, momentum from aloft gets dragged down to the
surface, and winds run stronger and gustier than the pressure gradient alone
would suggest. The same flow aloft produces meaningfully more surface wind in
November than in July.

Note that the season is not one continuous block. Shelf ice shuts down and
endangers North Shore spots in deep winter, so in practice it's **late
October-December**, then **March-April**, with a mid-winter gap in cold years.

## Lake-Specific Factors With No Ocean Analog

- **Seiche and wind setup.** No tides, but a sustained NE gale physically piles water against the Duluth end of the lake — often a foot or more — and then it sloshes back at roughly a 7.9-hour period for Superior. That changes how shallow reefs break, and it's far more useful than a tide field, which on a lake just returns zeros.
- **Fresh water is ~2.5% less dense than seawater.** Genuinely less float. Size up your board relative to what you'd ride in the ocean.
- **Water temperature stays punishing year-round.** Even August surface temps nearshore sit in the 50s°F. Prime season is 33-45°F water.

## Data Sources for Forecasting

To build a surf prediction system, you'll need to tap into several data sources:

### Weather.gov API
The National Weather Service provides detailed forecasts, but their standard forecast endpoint doesn't include wave data. Key endpoints:

- **Point metadata**: `https://api.weather.gov/points/46.5526,-91.4903`
- **Standard forecast**: `https://api.weather.gov/gridpoints/DLH/111,58/forecast`
- **Marine forecasts**: [https://www.weather.gov/marine/dlhmz](https://www.weather.gov/marine/dlhmz)

### NOAA Wave Models
- **GLERL Wave Predictions**: [https://www.glerl.noaa.gov/emf/waves/WW3/](https://www.glerl.noaa.gov/emf/waves/WW3/)
- **Great Lakes Coastal Forecast System**: [https://www.glerl.noaa.gov/res/glcfs/](https://www.glerl.noaa.gov/res/glcfs/)
- Updates every 3 hours with 3-day forecasts

The Great Lakes Wave Model uses WAVEWATCH III and incorporates HRRR wind forcing for the first 48 hours and GFS for extended forecasts.

### Weather.gov Alerts API

One of the most valuable data sources for surf forecasting is the NWS Alerts
API. Storm alerts, especially marine warnings, are excellent indicators of surf
conditions. When gale warnings are issued, you know big waves are coming.

**Key Alert Types for Surf Forecasting:**
- **Gale Warning** - Sustained winds 34-47 knots (39-54 mph) - prime surf conditions!
- **Storm Warning** - Winds 48+ knots - extreme surf, potentially dangerous
- **High Wind Warning** - Strong sustained winds that will build waves
- **Small Craft Advisory** - Moderate conditions, may indicate building surf

**Useful Endpoints:**

```bash
# All active alerts for Minnesota
https://api.weather.gov/alerts/active?area=MN

# Alerts for specific zone (Wisconsin North Shore)
https://api.weather.gov/alerts/active?zone=WIZ002

# Marine alerts for specific coordinates (Stoney Point area)
https://api.weather.gov/alerts/active?point=46.5526,-91.4903

# Filter by specific alert type
https://api.weather.gov/alerts/active?area=MN&event=Gale%20Warning
```

**How to Use Alerts for Surf Prediction:**

1. Monitor for Gale Warnings or Storm Warnings in the Lake Superior region
2. Check the wind direction in the alert description (looking for NE → NW shift)
3. Note the alert timing - waves typically build during the storm and peak as winds shift
4. Surf is often best 12-24 hours after the gale warning is issued, as waves organize

The alerts API contains data for the past 7 days, making it useful for both
real-time monitoring and historical analysis of what conditions produced good
surf.

## Building a Surf Alert System

A practical program should:
1. **Monitor NWS alerts** - Poll the alerts API for Gale Warnings and Storm Warnings
2. **Track wind patterns** - Monitor wind direction, speed, and duration over rolling 3-day windows, using *observed history* and not just forecast, since duration is a required input
3. **Score by fetch, not by facing** - Project each forecast wind direction against the spot's fetch-by-bearing table. A 25kt wind from a 5-mile-fetch bearing is worth nothing.
4. **Fetch wave predictions** - Get wave height forecasts from marine forecasts or GLERL models
5. **Analyze alert timing** - When a Gale Warning is issued, check wind direction and estimate peak surf timing
6. **Set thresholds** - Alert when conditions meet: 15+ mph for 2-3 days from a long-fetch bearing (NE/ENE), waves 4+ feet, and period at or above 4s. Gate hard on period — no wave height should grade well at 3s.
7. **Watch for the frontal shift** - The NE → NW veer is the quality signal. Score the hours *after* the wind swings offshore, not just the peak of the blow.
8. **Consider seasonality** - Prioritize late fall/winter monitoring when storms are most frequent, and suppress the deep-winter window when shelf ice closes spots out
9. **Send notifications** - Alert 12-24 hours before estimated peak conditions

The synoptic setup — where the low is and where it's tracking — leads the wave
model by two to three days. If you want a system that predicts rather than
reports, that's the input to build around.

The alerts API is particularly valuable because it aggregates expert analysis from NWS meteorologists. A Gale Warning means the conditions are serious enough for official notification, which almost always translates to surfable waves.

## Phase 2: Interactive Visualization with Mapbox

Once you have a working alert system, adding an interactive map takes the project to the next level. Mapbox provides a powerful and relatively straightforward way to visualize surf conditions geographically.

### What You Could Build

**Core Map Features:**
- **Surf spot markers** - Pin locations like Stoney Point, Park Point, Brighton Beach, etc.
- **Real-time weather overlay** - Wind speed/direction visualized with arrows
- **Alert zone highlighting** - Polygon layers showing active Gale Warning zones
- **Wave height heatmap** - Color-coded regions based on GLERL wave predictions
- **Historical data** - Click a spot to see past surf conditions

**Interactive Elements:**
- Click on a surf spot to see current forecast and recent conditions
- Toggle layers (wind, waves, alerts, water temperature)
- Time slider to see forecast evolution over next 48 hours
- Drive time from Minneapolis overlaid as isochrones

### Implementation Approach

**1. Basic Setup (Simple)**
```javascript
// Initialize map centered on Lake Superior
mapboxgl.accessToken = 'YOUR_TOKEN';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [-91.49, 46.55], // Stoney Point area
  zoom: 9
});

// Add surf spot markers
const surfSpots = [
  { name: 'Stoney Point', coords: [-91.49, 46.55] },
  { name: 'Park Point', coords: [-92.07, 46.73] },
  // ... more spots
];

surfSpots.forEach(spot => {
  new mapboxgl.Marker()
    .setLngLat(spot.coords)
    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${spot.name}</h3>`))
    .addTo(map);
});
```

**2. Add Weather Data (Moderate)**
- Fetch wind data from Weather.gov API
- Create a vector layer showing wind direction/speed
- Update every hour with fresh data
- Use Mapbox expressions to style based on wind intensity

**3. Alert Zones (Moderate)**
- Parse alert polygons from NWS API (alerts include GeoJSON geometries)
- Add as fill layers with styling based on alert severity
- Auto-update when new alerts are issued

**4. Wave Height Overlay (Advanced)**
- Parse GLERL wave model data
- Convert to GeoJSON grid
- Render as a heatmap or contour layer
- Animate over time to show wave evolution

### Technical Considerations

**Pros:**
- Mapbox free tier: 50,000 map loads/month (plenty for personal use)
- Excellent documentation and examples
- Works great with Hugo static sites (just add JS to a template)
- Mobile-responsive out of the box
- Can export data for offline use

**Challenges:**
- Need to handle API rate limits for real-time data
- Wave model data isn't in an easy-to-consume format (may need backend processing)
- NWS alert polygons can be complex geometries
- Keeping data fresh requires periodic updates (consider serverless functions)

### Getting Started

1. Sign up for a free Mapbox account
2. Add Mapbox GL JS to your Hugo site (via CDN or npm)
3. Create a simple map with surf spot markers
4. Incrementally add data layers as you build out the API integrations
5. Consider using Netlify/Vercel functions to proxy API calls and cache data

The beauty of this approach is you can start simple (just a map with pins) and gradually layer on complexity as your data pipeline matures.

## The Challenge

The biggest challenge is that the standard weather API doesn't expose wave height data easily. You'll need to either:
- Parse the marine forecast text products from NOAA
- Use the GLERL wave model visualizations/data
- Find alternative APIs that aggregate this data

## Resources

- [NDBC Marine Forecast - Duluth](https://www.ndbc.noaa.gov/data/Forecasts/FZUS53.KDLH.html)
- [Great Lakes Marine Forecasts - Duluth Zone](https://www.weather.gov/marine/dlhmz)
- [Lake Superior Open Waters Marine Forecast](https://www.weather.gov/marine/lsopen)
- [Forecasting Guide - Sleeping Bear Surf](https://sleepingbearsurf.com/forecasting/)
- [Great Lakes Surf Radar](https://surfradar.info/)

---

*Notes: This is a starting point for building an automated surf forecasting
system for Lake Superior. The critical factors are wind speed, fetch along the
wind bearing, and duration — those three set the ceiling — with wave period as
the quality gate and the post-frontal wind shift as the timing signal. Wave
height alone tells you very little here.*

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

## Key Data Points for Surfable Conditions

### Wind Direction
- **Northwest (NW)** winds are commonly cited by local surfers
- Research shows **Northeast (NE)** winds typically create the best waves initially, which then smooth out as winds shift to N or NW
- Wind direction determines the fetch (distance wind travels over water)

### Wind Speed
- Look for sustained winds of **15-25+ mph** (or 10-20+ knots)
- Gale conditions (30+ knots) can produce waves of 6-8 feet

### Wind Duration
- **2-3 days of consistent wind** from the same direction is the sweet spot
- Longer sustained periods build larger, more organized waves

### Wave Height
- Surfable waves: **4-6+ feet** are ideal
- Smaller waves (2-3 feet) can work but are less consistent
- During calm conditions, waves may be less than 1 foot
- Storm systems can produce 6-8+ foot waves

### Wave Period
- Longer wave periods (8+ seconds) create better quality waves
- This indicates well-formed swells vs choppy wind waves

## Seasonal Considerations

Late fall and winter are the best times for Lake Superior surfing. Storm systems
move through more frequently, and the temperature difference creates more
dramatic weather patterns. Most surfable conditions occur when low-pressure
systems generate strong winds across the lake.

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
2. **Track wind patterns** - Monitor wind direction, speed, and duration over rolling 3-day windows
3. **Fetch wave predictions** - Get wave height forecasts from marine forecasts or GLERL models
4. **Analyze alert timing** - When a Gale Warning is issued, check wind direction and estimate peak surf timing
5. **Set thresholds** - Alert when conditions meet: NW/NE winds 15+ mph for 2-3 days + waves 4+ feet
6. **Consider seasonality** - Prioritize late fall/winter monitoring when storms are most frequent
7. **Send notifications** - Alert 12-24 hours before estimated peak conditions

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

*Notes: This is a starting point for building an automated surf forecasting system for Lake Superior. The combination of wind persistence, direction, and wave height are the critical factors.*

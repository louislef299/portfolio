// src/lib/data-fetcher.ts
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}
async function fetchCities() {
  return fetchJson("/data/cities.json");
}
async function fetchCountries() {
  return fetchJson("/data/countries.json");
}

// src/map/index.ts
class TravelMap {
  config;
  constructor(config) {
    this.config = config;
  }
  async initialize() {
    try {
      const [cities, countries] = await Promise.all([
        fetchCities(),
        fetchCountries()
      ]);
      console.log("Loaded cities:", cities.length);
      console.log("Loaded countries:", countries.length);
      this.initializeMap();
      this.plotCities(cities);
      this.plotCountries(countries);
    } catch (error) {
      console.error("Failed to initialize map:", error);
      throw error;
    }
  }
  initializeMap() {}
  plotCities(cities) {
    console.log("TODO: Plot cities", cities);
  }
  plotCountries(countries) {
    console.log("TODO: Plot countries", countries);
  }
  destroy() {}
}
async function createTravelMap(config) {
  const map = new TravelMap(config);
  await map.initialize();
  return map;
}

// src/main.ts
function initializeApp() {
  console.log("Portfolio app initializing...");
  const mapContainer = document.getElementById("travel-map");
  if (mapContainer) {
    initializeTravelMap(mapContainer.id);
  }
}
async function initializeTravelMap(containerId) {
  try {
    const config = {
      containerId,
      dataUrl: "/data/cities.json",
      zoom: 2,
      center: [20, 0]
    };
    const map = await createTravelMap(config);
    console.log("Travel map initialized successfully", map);
  } catch (error) {
    console.error("Failed to initialize travel map:", error);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
export {
  initializeTravelMap
};

//# debugId=579EC0D3C3BEE9CA64756E2164756E21
//# sourceMappingURL=main.js.map

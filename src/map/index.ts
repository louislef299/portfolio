/**
 * Interactive map initialization and rendering
 *
 * TODO: Implement map using Leaflet
 * - Initialize Leaflet map
 * - Add base layer (OpenStreetMap or similar)
 * - Plot cities as markers
 * - Add country highlighting
 * - Add tooltips/popups with city names and dates
 */

import type { MapConfig } from './types';
import { fetchCities, fetchCountries } from '../lib/data-fetcher';
// import L from 'leaflet'; // Uncomment when implementing

export class TravelMap {
  private config: MapConfig;
  // private map: L.Map | null = null; // Uncomment when implementing

  constructor(config: MapConfig) {
    this.config = config;
  }

  /**
   * Initialize the map and load data
   */
  async initialize(): Promise<void> {
    try {
      const [cities, countries] = await Promise.all([
        fetchCities(),
        fetchCountries(),
      ]);

      console.log('Loaded cities:', cities.length);
      console.log('Loaded countries:', countries.length);

      // TODO: Initialize Leaflet map here
      this.initializeMap();

      // TODO: Plot cities and countries
      this.plotCities(cities);
      this.plotCountries(countries);
    } catch (error) {
      console.error('Failed to initialize map:', error);
      throw error;
    }
  }

  /**
   * Initialize the Leaflet map instance
   */
  private initializeMap(): void {
    // TODO: Implement Leaflet map initialization
    // Example:
    // this.map = L.map(this.config.containerId).setView(
    //   this.config.center ?? [20, 0],
    //   this.config.zoom ?? 2
    // );
    //
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '© OpenStreetMap contributors'
    // }).addTo(this.map);
  }

  /**
   * Plot cities on the map
   */
  private plotCities(cities: any[]): void {
    // TODO: Implement city plotting
    console.log('TODO: Plot cities', cities);
  }

  /**
   * Plot countries on the map
   */
  private plotCountries(countries: any[]): void {
    // TODO: Implement country highlighting
    console.log('TODO: Plot countries', countries);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // TODO: Clean up Leaflet resources if needed
    // if (this.map) {
    //   this.map.remove();
    //   this.map = null;
    // }
  }
}

/**
 * Factory function to create and initialize a travel map
 */
export async function createTravelMap(config: MapConfig): Promise<TravelMap> {
  const map = new TravelMap(config);
  await map.initialize();
  return map;
}

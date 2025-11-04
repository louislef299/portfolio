/**
 * Type definitions for map data structures
 */

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  fillKey: 'city' | 'nationalPark';
  date: string;
}

export interface Country {
  name: string;
  code: string;
  fillKey?: string;
}

export interface MapData {
  cities: City[];
  countries: Country[];
}

export interface MapConfig {
  containerId: string;
  dataUrl: string;
  zoom?: number;
  center?: [number, number];
}

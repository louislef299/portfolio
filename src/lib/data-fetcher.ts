/**
 * Utility functions for fetching and handling data
 */

import type { City, Country } from '../map/types';

/**
 * Fetches JSON data from a given URL
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetches city data from the static JSON file
 */
export async function fetchCities(): Promise<City[]> {
  return fetchJson<City[]>('/data/cities.json');
}

/**
 * Fetches country data from the static JSON file
 */
export async function fetchCountries(): Promise<Country[]> {
  return fetchJson<Country[]>('/data/countries.json');
}

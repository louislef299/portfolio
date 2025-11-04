/**
 * Main entry point for the portfolio application
 *
 * This file is bundled by Bun and loaded by Hugo pages
 */

import { createTravelMap } from './map';
import type { MapConfig } from './map/types';

// Import Leaflet CSS (will be bundled)
// import 'leaflet/dist/leaflet.css'; // Uncomment when ready to use Leaflet

/**
 * Initialize the application when DOM is ready
 */
function initializeApp(): void {
  console.log('Portfolio app initializing...');

  // Check if we're on a page that needs the travel map
  const mapContainer = document.getElementById('travel-map');

  if (mapContainer) {
    initializeTravelMap(mapContainer.id);
  }
}

/**
 * Initialize the travel map
 */
async function initializeTravelMap(containerId: string): Promise<void> {
  try {
    const config: MapConfig = {
      containerId,
      dataUrl: '/data/cities.json', // Not currently used, but available
      zoom: 2,
      center: [20, 0], // Center of world map
    };

    const map = await createTravelMap(config);
    console.log('Travel map initialized successfully', map);
  } catch (error) {
    console.error('Failed to initialize travel map:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Export for potential external use
export { initializeTravelMap };

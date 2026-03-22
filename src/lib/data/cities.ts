export interface City {
	name: string;
	latitude: number;
	longitude: number;
	radius: number;
	fillKey: string;
	date: string;
}

export const CITIES: City[] = [
	{ name: 'Bozeman', latitude: 45.677, longitude: -111.0429, radius: 3, fillKey: 'city', date: '2017-03' },
	{ name: 'Santa Cruz', latitude: 36.9741, longitude: -122.0308, radius: 3, fillKey: 'city', date: '2023-11' },
	{ name: 'New York City', latitude: 40.7128, longitude: -74.006, radius: 3, fillKey: 'city', date: '2024-09' },
	{ name: 'Stoney Point', latitude: 46.9255, longitude: -91.8217, radius: 3, fillKey: 'city', date: '2024-11' },
	{ name: 'San Diego', latitude: 32.7157, longitude: -117.1611, radius: 3, fillKey: 'city', date: '2022-07' },
	{ name: 'Washington, DC', latitude: 38.9072, longitude: -77.0369, radius: 3, fillKey: 'city', date: '2024-09' },
	{ name: 'Seattle', latitude: 47.6062, longitude: -122.3321, radius: 3, fillKey: 'city', date: '2020-08' },
	{ name: 'Daytona Beach', latitude: 29.2108, longitude: -81.0228, radius: 3, fillKey: 'city', date: '2017-03' },
	{ name: 'Whitefish', latitude: 48.4117, longitude: -114.335, radius: 3, fillKey: 'city', date: '2018-08' },
	{ name: 'Bighorn National Park', latitude: 44.5451, longitude: -107.3578, radius: 3, fillKey: 'city', date: '2020-08' },
	{ name: 'Denver', latitude: 39.7392, longitude: -104.9903, radius: 3, fillKey: 'city', date: '2022-02' },
	{ name: 'Cape Coral', latitude: 26.5629, longitude: -81.9495, radius: 3, fillKey: 'city', date: '2021-04' },
	{ name: 'Cancun', latitude: 21.1619, longitude: -86.8515, radius: 3, fillKey: 'city', date: '2023-03' },
	{ name: 'St. Thomas, Bakkero', latitude: 18.3381, longitude: -64.9407, radius: 3, fillKey: 'city', date: '2014-04' },
	{ name: 'San Jose', latitude: 9.9281, longitude: -84.0907, radius: 3, fillKey: 'city', date: '2015-04' },
	{ name: 'London', latitude: 51.5074, longitude: -0.1278, radius: 3, fillKey: 'city', date: '2019-11' },
	{ name: 'Montpellier', latitude: 43.6119, longitude: 3.8772, radius: 3, fillKey: 'city', date: '2019-09' },
	{ name: 'Lagos', latitude: 37.102, longitude: -8.6742, radius: 3, fillKey: 'city', date: '2022-03' },
	{ name: 'Barcelona', latitude: 41.3851, longitude: 2.1734, radius: 3, fillKey: 'city', date: '2019-11' },
	{ name: 'Emo', latitude: 49.0032, longitude: -93.7113, radius: 3, fillKey: 'city', date: '2024-07' },
	{ name: 'Chamonix', latitude: 45.9237, longitude: 6.8694, radius: 3, fillKey: 'city', date: '2019-12' },
	{ name: 'Savannah', latitude: 32.0809, longitude: -81.0912, radius: 3, fillKey: 'city', date: '2024-03' },
	{ name: 'Arches National Park', latitude: 38.5826, longitude: -109.4879, radius: 3, fillKey: 'nationalPark', date: '2023-10' },
	{ name: 'Yellowstone National Park', latitude: 44.6367, longitude: -110.4153, radius: 3, fillKey: 'nationalPark', date: '2021-06' },
	{ name: 'Badlands National Park', latitude: 43.8723, longitude: -102.2997, radius: 3, fillKey: 'nationalPark', date: '2020-08' },
	{ name: "Devil's Tower", latitude: 44.5977, longitude: -104.718, radius: 3, fillKey: 'nationalPark', date: '2020-08' },
	{ name: 'George Town', latitude: 19.2968, longitude: -81.381, radius: 3, fillKey: 'city', date: '2009-03' },
	{ name: 'Rincón', latitude: 18.3421, longitude: -67.2515, radius: 3, fillKey: 'city', date: '2025-03' },
	{ name: 'Chicago', latitude: 41.8338, longitude: -87.8967, radius: 3, fillKey: 'city', date: '2019-07' },
	{ name: 'Decorah', latitude: 43.3006, longitude: -91.8461, radius: 3, fillKey: 'city', date: '2019-05' },
	{ name: 'Grand Teton National Park', latitude: 43.8078, longitude: -110.8533, radius: 3, fillKey: 'nationalPark', date: '2025-08' },
	{ name: 'Morro Bay', latitude: 35.3769, longitude: -120.913, radius: 3, fillKey: 'city', date: '2025-09' },
	{ name: 'Del Mar', latitude: 32.9589, longitude: -117.2846, radius: 3, fillKey: 'city', date: '2026-02' }
];

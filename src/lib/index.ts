export { db } from './database';

export function generateShortCode(length = 5): string {
	const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
	let code = '';
	for (let i = 0; i < length; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

interface Restaurant {
	name: string;
	lat: number;
	lon: number;
	cuisine?: string;
}

interface OverpassElement {
	tags?: { name?: string; cuisine?: string };
	lat?: number;
	lon?: number;
	center?: { lat: number; lon: number };
}

interface OverpassResponse {
	elements: OverpassElement[];
}

export async function getRestaurantsFromLocation(
	latitude: number,
	longitude: number,
	radius = 2000
): Promise<Restaurant[]> {
	const query = `
		[out:json];
		(
			node["amenity"="restaurant"](around:${radius},${latitude},${longitude});
			way["amenity"="restaurant"](around:${radius},${latitude},${longitude});
		);
		out body;
	`;

	const response = await fetch('https://overpass-api.de/api/interpreter', {
		method: 'POST',
		body: query
	});

	if (!response.ok) {
		throw new Error('Failed to fetch restaurants from Overpass API');
	}

	const data = (await response.json()) as OverpassResponse;
	const restaurants: Restaurant[] = data.elements
		.filter((el) => el.tags?.name)
		.map((el) => ({
			name: el.tags!.name!,
			lat: el.lat || el.center?.lat || 0,
			lon: el.lon || el.center?.lon || 0,
			cuisine: el.tags!.cuisine
		}))
		.filter((r) => r.lat && r.lon);

	return restaurants;
}

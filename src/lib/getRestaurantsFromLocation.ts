interface Restaurant {
	name: string;
	lat: number;
	lon: number;
	cuisine?: string;
	website?: string;
}

interface OverpassElement {
	tags?: { name?: string; cuisine?: string; website?: string };
}
interface OverpassNode extends OverpassElement {
	type: 'node';
	lat?: number;
	lon?: number;
}
interface OverpassWay extends OverpassElement {
	type: 'way';
	center?: { lat: number; lon: number };
}

interface OverpassResponse {
	elements: Array<OverpassNode | OverpassWay>;
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
		out center;
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
		.map((el) =>
			el.type === 'node'
				? {
						name: el.tags!.name!,
						lat: el.lat || 0,
						lon: el.lon || 0,
						cuisine: el.tags!.cuisine,
						website: el.tags!.website
					}
				: {
						name: el.tags!.name!,
						lat: el.center?.lat || 0,
						lon: el.center?.lon || 0,
						cuisine: el.tags!.cuisine,
						website: el.tags!.website
					}
		)
		.filter((r) => r.lat && r.lon);

	return restaurants;
}

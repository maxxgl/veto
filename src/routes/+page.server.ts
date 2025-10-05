import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db, generateShortCode } from '$lib';

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

async function getRestaurantsFromLocation(
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

export const actions = {
	// create: async ({ locals, request }) => {
	create: async ({ locals }) => {
		if (!locals.user) {
			redirect(303, '/login?action=create');
		}
		// const formData = await request.formData();
		// const latitude = parseFloat(formData.get('latitude')?.toString() || '0');
		// const longitude = parseFloat(formData.get('longitude')?.toString() || '0');
		const latitude = 35.093644;
		const longitude = -106.5184779;

		let code: string;
		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			code = generateShortCode();

			try {
				await db
					.insertInto('sessions')
					.values({
						code,
						gps_lat: latitude,
						gps_lng: longitude,
						owner_id: locals.user.id
					})
					.execute();

				await db
					.insertInto('session_players')
					.values({
						session_code: code,
						user_id: locals.user.id
					})
					.execute();

				const restaurants = await getRestaurantsFromLocation(latitude, longitude);

				if (restaurants.length > 0) {
					await db
						.insertInto('options')
						.values(
							restaurants.map((r) => ({
								name: r.name,
								gps_lat: r.lat,
								gps_lng: r.lon,
								genre: r.cuisine || null
							}))
						)
						.execute();
				}

				redirect(303, '/' + code);
			} catch (err) {
				attempts++;
				if (attempts >= maxAttempts) {
					throw err;
				}
			}
		}

		error(500, 'Failed to generate unique session code');
	},
	join: async ({ request, locals }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString()?.toUpperCase();

		if (!code) {
			error(400, 'Session code is required');
		}

		if (!locals.user) {
			redirect(303, `/login?action=join&code=${code}`);
		}

		const session = await db
			.selectFrom('sessions')
			.select('code')
			.where('code', '=', code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		redirect(303, '/' + code + '/join');
	}
} satisfies Actions;

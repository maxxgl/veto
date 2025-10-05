import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db, generateShortCode, getRestaurantsFromLocation } from '$lib';

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
								genre: r.cuisine || null,
								session_code: code
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

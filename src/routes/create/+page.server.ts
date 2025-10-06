import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db, generateShortCode, getRestaurantsFromLocation } from '$lib';

export const actions = {
	default: async ({ locals, request }) => {
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/login?action=create');
		}

		const formData = await request.formData();
		const latitude = parseFloat(formData.get('latitude')?.toString() || '0');
		const longitude = parseFloat(formData.get('longitude')?.toString() || '0');
		const radiusMiles = parseFloat(formData.get('radius')?.toString() || '2');

		const radiusMeters = radiusMiles * 1609.34;

		const code = await db.transaction().execute(async (trx) => {
			const code = await generateShortCode(trx);
			const restaurants = await getRestaurantsFromLocation(latitude, longitude, radiusMeters);
			await trx
				.insertInto('sessions')
				.values({
					code,
					gps_lat: latitude,
					gps_lng: longitude,
					radiusMiles: radiusMiles,
					owner_id: user.id
				})
				.execute();

			await trx
				.insertInto('session_players')
				.values({
					session_code: code,
					user_id: user.id
				})
				.execute();

			if (restaurants.length > 0) {
				await trx
					.insertInto('options')
					.values(
						restaurants.map((r) => ({
							...r,
							session_code: code
						}))
					)
					.execute();
			}
			return code;
		});

		redirect(303, '/' + code);
	}
} satisfies Actions;

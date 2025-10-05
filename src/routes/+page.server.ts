import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db, generateShortCode, getRestaurantsFromLocation } from '$lib';

export const actions = {
	// create: async ({ locals, request }) => {
	create: async ({ locals }) => {
		// We add this intermediate variable because typescript throws an error
		// for some reason if you just narrow the `locals.user` type in the tx
		const user = locals.user;
		if (!user) {
			throw redirect(303, '/login?action=create');
		}

		// const formData = await request.formData();
		// const latitude = parseFloat(formData.get('latitude')?.toString() || '0');
		// const longitude = parseFloat(formData.get('longitude')?.toString() || '0');
		const latitude = 35.093644;
		const longitude = -106.5184779;

		const code = await db.transaction().execute(async (trx) => {
			const code = await generateShortCode(trx);
			const restaurants = await getRestaurantsFromLocation(latitude, longitude);
			await trx
				.insertInto('sessions')
				.values({
					code,
					gps_lat: latitude,
					gps_lng: longitude,
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
							name: r.name,
							gps_lat: r.lat,
							gps_lng: r.lon,
							genre: r.cuisine || null,
							session_code: code
						}))
					)
					.execute();
			}
			return code;
		});

		redirect(303, '/' + code);
	},
	join: async ({ request, locals }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString()?.toUpperCase();

		if (!code) {
			error(400, 'Session code is required');
		}

		if (!locals.user) {
			throw redirect(303, `/login?action=join&code=${code}`);
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

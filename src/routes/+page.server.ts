import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db, generateShortCode } from '$lib';

export const actions = {
	create: async ({ locals }) => {
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
						gps_lat: 0,
						gps_lng: 0,
						owner_id: locals.user!.id
					})
					.execute();

				await db
					.insertInto('session_players')
					.values({
						session_code: code,
						user_id: locals.user!.id
					})
					.execute();

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
	join: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString()?.toUpperCase();

		if (!code) {
			error(400, 'Session code is required');
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

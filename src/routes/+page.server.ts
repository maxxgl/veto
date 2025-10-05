import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib';
import { randomUUID } from 'crypto';

export const actions = {
	create: async ({ locals }) => {
		const uuid = randomUUID();

		await db
			.insertInto('sessions')
			.values({
				uuid,
				gps_lat: 0,
				gps_lng: 0,
				owner_id: locals.user!.id
			})
			.execute();

		await db
			.insertInto('session_players')
			.values({
				session_uuid: uuid,
				user_id: locals.user!.id
			})
			.execute();

		redirect(303, '/' + uuid);
	},
	join: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString();

		if (!code) {
			error(400, 'Session code is required');
		}

		const session = await db
			.selectFrom('sessions')
			.select('uuid')
			.where('uuid', '=', code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		redirect(303, '/' + code + '/join');
	}
} satisfies Actions;

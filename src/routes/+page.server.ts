import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib';
import { randomUUID } from 'crypto';

export const actions = {
	default: async ({ locals }) => {
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
	}
} satisfies Actions;

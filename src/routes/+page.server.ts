import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib';
import { randomUUID } from 'crypto';

export const actions = {
	default: async () => {
		// const owner = await db
		// 	.insertInto('users')
		// 	.values({
		// 		username: 'Owner',
		// 		hashed_password: 'asdf',
		// 		gps_lat: null,
		// 		gps_lng: null
		// 	})
		// 	.returningAll()
		// 	.executeTakeFirstOrThrow();

		const uuid = randomUUID();

		await db
			.insertInto('sessions')
			.values({
				uuid,
				gps_lat: 0,
				gps_lng: 0,
				owner_id: 1
			})
			.execute();

		redirect(303, '/' + uuid);
	}
} satisfies Actions;

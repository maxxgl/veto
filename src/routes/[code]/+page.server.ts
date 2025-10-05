import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const data = await db
		.selectFrom('sessions')
		.selectAll()
		.where('uuid', '=', params.code)
		.executeTakeFirst();

	if (!data) {
		error(404);
	}

	const isParticipant = locals.user
		? await db
				.selectFrom('session_players')
				.selectAll()
				.where('session_uuid', '=', params.code)
				.where('user_id', '=', locals.user.id)
				.executeTakeFirst()
		: null;

	const options = await db.selectFrom('options').selectAll().execute();
	// if (!data) {
	// 	const result = await db
	// 		.insertInto('sessions')
	// 		.values({
	// 			uuid: 'b941d622-5c5f-4cc6-8e23-1d84049dc410',
	// 			owner_id: 1,
	// 			gps_lat: 10,
	// 			gps_lng: 10
	// 		})
	// 		.execute();
	//
	// 	return { data: result };
	// }

	const isOwner = locals.user?.id === data.owner_id;

	return {
		data,
		options,
		isParticipant: !!isParticipant,
		currentUser: locals.user,
		isOwner
	};
};

export const actions = {
	addUser: async () => {
		const result = await db.selectFrom('users').selectAll().execute();

		return result;
	},
	start: async ({ url, params, locals }) => {
		if (!locals.user) {
			error(401, 'Must be logged in to start session');
		}

		const session = await db
			.selectFrom('sessions')
			.select('owner_id')
			.where('uuid', '=', params.code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		if (session.owner_id !== locals.user.id) {
			error(403, 'Only the session owner can start the session');
		}

		const result = await db
			.insertInto('rounds')
			.values({
				round: 1,
				session_uuid: params.code
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		redirect(303, url.pathname + '/' + result.round);
	}
} satisfies Actions;

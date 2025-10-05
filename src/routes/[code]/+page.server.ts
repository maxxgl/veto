import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const isParticipant = locals.user
		? await db
				.selectFrom('session_players')
				.selectAll()
				.where('session_code', '=', params.code)
				.where('user_id', '=', locals.user.id)
				.executeTakeFirst()
		: null;

	const currentRound = await db
		.selectFrom('rounds')
		.select('round')
		.where('session_code', '=', params.code)
		.orderBy('round', 'desc')
		.executeTakeFirst();

	const options = await db
		.selectFrom('options')
		.selectAll()
		.where('session_code', '=', params.code)
		.execute();

	return {
		options,
		isParticipant: !!isParticipant,
		currentUser: locals.user,
		currentRound: currentRound?.round
	};
};

export const actions = {
	start: async ({ url, params, locals }) => {
		if (!locals.user) {
			error(401, 'Must be logged in to start session');
		}

		const session = await db
			.selectFrom('sessions')
			.select('owner_id')
			.where('code', '=', params.code)
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
				session_code: params.code
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		redirect(303, url.pathname + '/' + result.round);
	}
} satisfies Actions;

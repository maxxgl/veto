import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		redirect(303, `/login?redirect=/${params.code}/join`);
	}

	const alreadyJoined = await db
		.selectFrom('session_players')
		.selectAll()
		.where('session_code', '=', params.code)
		.where('user_id', '=', locals.user.id)
		.executeTakeFirst();

	if (alreadyJoined) {
		const currentRound = await db
			.selectFrom('rounds')
			.select('round')
			.where('session_code', '=', params.code)
			.orderBy('round', 'desc')
			.executeTakeFirst();

		if (currentRound) {
			redirect(303, `/${params.code}/voting`);
		} else {
			redirect(303, `/${params.code}`);
		}
	}

	return {
		currentUser: locals.user
	};
};

export const actions = {
	default: async ({ params, locals }) => {
		if (!locals.user) {
			error(401, 'Must be logged in to join');
		}

		const session = await db
			.selectFrom('sessions')
			.selectAll()
			.where('code', '=', params.code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		await db
			.insertInto('session_players')
			.values({
				session_code: params.code,
				user_id: locals.user.id
			})
			.execute();

		const currentRound = await db
			.selectFrom('rounds')
			.select('round')
			.where('session_code', '=', params.code)
			.orderBy('round', 'desc')
			.executeTakeFirst();

		if (currentRound) {
			redirect(303, `/${params.code}/voting`);
		} else {
			redirect(303, `/${params.code}`);
		}
	}
} satisfies Actions;

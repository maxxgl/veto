import type { LayoutServerLoad } from './$types';
import { db } from '$lib';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	depends('session:data');

	const session = await db
		.selectFrom('sessions')
		.selectAll()
		.where('code', '=', params.code)
		.executeTakeFirst();

	if (!session) {
		error(404, 'Session not found');
	}

	const participants = await db
		.selectFrom('session_players')
		.innerJoin('users', 'session_players.user_id', 'users.id')
		.select(['users.id', 'users.username'])
		.where('session_code', '=', params.code)
		.execute();

	return {
		session,
		participants: participants.map((p) => ({
			...p,
			isOwner: p.id === session.owner_id
		}))
	};
};

import type { LayoutServerLoad } from './$types';
import { db } from '$lib';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, depends }) => {
	depends('session:data');

	const [session, participants, votes] = await Promise.all([
		db.selectFrom('sessions').selectAll().where('code', '=', params.code).executeTakeFirst(),
		db
			.selectFrom('session_players')
			.innerJoin('users', 'session_players.user_id', 'users.id')
			.select(['users.id', 'users.username'])
			.where('session_code', '=', params.code)
			.execute(),
		db.selectFrom('votes').select('option_id').where('session_code', '=', params.code).execute()
	]);

	if (!session) {
		error(404, 'Session not found');
	}

	const vetoedOptionIds = new Set(votes.map((v) => v.option_id));

	return {
		session,
		participants: participants.map((p) => ({
			...p,
			isOwner: p.id === session.owner_id
		})),
		vetoedOptionIds
	};
};

import type { Actions } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const round = await db
		.selectFrom('rounds')
		.selectAll()
		.where('session_uuid', '=', params.code)
		.where('round', '=', Number(params.round))
		.executeTakeFirst();

	if (!round) {
		error(404, 'Round not found');
	}

	const session = await db
		.selectFrom('sessions')
		.select('owner_id')
		.where('uuid', '=', params.code)
		.executeTakeFirst();

	if (!session) {
		error(404, 'Session not found');
	}

	const votedOptionIds = await db
		.selectFrom('votes')
		.select('option_id')
		.where('session_uuid', '=', params.code)
		.where('round_id', '<=', Number(params.round))
		.execute();

	const votedIds = votedOptionIds.map((v) => v.option_id);

	const options = await db
		.selectFrom('options')
		.selectAll()
		.where('id', 'not in', votedIds.length > 0 ? votedIds : [-1])
		.execute();

	const votesThisRound = await db
		.selectFrom('votes')
		.innerJoin('users', 'votes.user_id', 'users.id')
		.select(['votes.user_id', 'users.username'])
		.where('session_uuid', '=', params.code)
		.where('round_id', '=', Number(params.round))
		.execute();

	const users = await db
		.selectFrom('users')
		.selectAll()
		.where('id', 'in', db.selectFrom('sessions').select('owner_id').where('uuid', '=', params.code))
		.execute();

	const currentPlayerId = session.owner_id;
	const hasVoted = votesThisRound.some((v) => v.user_id === currentPlayerId);

	return {
		options,
		round,
		isMyTurn: !hasVoted,
		currentPlayerId,
		votesThisRound,
		users
	};
};

export const actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const optionId = formData.get('option_id');

		const round = await db
			.selectFrom('rounds')
			.selectAll()
			.where('session_uuid', '=', params.code)
			.where('round', '=', Number(params.round))
			.executeTakeFirst();

		if (!round) {
			error(404, 'Round not found');
		}

		if (!optionId) {
			error(400, 'Missing option_id');
		}

		const session = await db
			.selectFrom('sessions')
			.select('owner_id')
			.where('uuid', '=', params.code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		await db
			.insertInto('votes')
			.values({
				user_id: session.owner_id,
				option_id: Number(optionId),
				round_id: round.round,
				session_uuid: params.code
			})
			.execute();

		const users = await db
			.selectFrom('users')
			.selectAll()
			.where(
				'id',
				'in',
				db.selectFrom('sessions').select('owner_id').where('uuid', '=', params.code)
			)
			.execute();

		const votesThisRound = await db
			.selectFrom('votes')
			.select('user_id')
			.where('session_uuid', '=', params.code)
			.where('round_id', '=', round.round)
			.execute();

		if (votesThisRound.length >= users.length) {
			await db
				.insertInto('rounds')
				.values({
					round: round.round + 1,
					session_uuid: params.code
				})
				.execute();

			redirect(303, `/${params.code}/${round.round + 1}`);
		}
	}
} satisfies Actions;

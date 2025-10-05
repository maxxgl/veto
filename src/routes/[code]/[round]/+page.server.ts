import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	depends('round:data');

	const round = await db
		.selectFrom('rounds')
		.selectAll()
		.where('session_code', '=', params.code)
		.where('round', '=', Number(params.round))
		.executeTakeFirst();

	if (!round) {
		error(404, 'Round not found');
	}

	const session = await db
		.selectFrom('sessions')
		.select('owner_id')
		.where('code', '=', params.code)
		.executeTakeFirst();

	if (!session) {
		error(404, 'Session not found');
	}

	const allOptions = await db.selectFrom('options').selectAll().execute();

	const previousVotes = await db
		.selectFrom('votes')
		.innerJoin('users', 'votes.user_id', 'users.id')
		.select(['votes.option_id', 'votes.round_id', 'users.username'])
		.where('session_code', '=', params.code)
		.where('round_id', '<', Number(params.round))
		.execute();

	const previousVotesMap = previousVotes.reduce(
		(acc, vote) => {
			acc[vote.option_id] = { round: vote.round_id, username: vote.username };
			return acc;
		},
		{} as Record<number, { round: number; username: string }>
	);

	const votesThisRound = await db
		.selectFrom('votes')
		.innerJoin('users', 'votes.user_id', 'users.id')
		.select(['votes.user_id', 'users.username', 'votes.option_id'])
		.where('session_code', '=', params.code)
		.where('round_id', '=', Number(params.round))
		.execute();

	const users = await db
		.selectFrom('session_players')
		.innerJoin('users', 'session_players.user_id', 'users.id')
		.select(['users.id', 'users.username'])
		.where('session_code', '=', params.code)
		.execute();

	const vetoedOptions = votesThisRound.reduce(
		(acc, vote) => {
			acc[vote.option_id] = { username: vote.username, userId: vote.user_id };
			return acc;
		},
		{} as Record<number, { username: string; userId: number }>
	);

	if (votesThisRound.length >= users.length) {
		const nextRound = await db
			.selectFrom('rounds')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('round', '=', Number(params.round) + 1)
			.executeTakeFirst();

		if (nextRound) {
			redirect(303, `/${params.code}/${nextRound.round}`);
		}

		const votedOptionIdsIncludingThisRound = await db
			.selectFrom('votes')
			.select('option_id')
			.where('session_code', '=', params.code)
			.where('round_id', '<=', Number(params.round))
			.execute();

		const votedIdsIncludingThisRound = votedOptionIdsIncludingThisRound.map((v) => v.option_id);

		const remainingOptions = await db
			.selectFrom('options')
			.selectAll()
			.where(
				'id',
				'not in',
				votedIdsIncludingThisRound.length > 0 ? votedIdsIncludingThisRound : [-1]
			)
			.execute();

		if (remainingOptions.length === 1) {
			redirect(303, `/${params.code}/win`);
		}
	}

	const currentPlayerId = locals.user?.id;
	const hasVoted = votesThisRound.some((v) => v.user_id === currentPlayerId);

	return {
		options: allOptions,
		round,
		isMyTurn: !hasVoted,
		currentPlayerId,
		votesThisRound,
		users,
		vetoedOptions,
		previousVotesMap
	};
};

export const actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) {
			error(401, 'Must be logged in to vote');
		}

		const formData = await request.formData();
		const optionId = formData.get('option_id');

		const round = await db
			.selectFrom('rounds')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('round', '=', Number(params.round))
			.executeTakeFirst();

		if (!round) {
			error(404, 'Round not found');
		}

		if (!optionId) {
			error(400, 'Missing option_id');
		}

		const isParticipant = await db
			.selectFrom('session_players')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('user_id', '=', locals.user.id)
			.executeTakeFirst();

		if (!isParticipant) {
			error(403, 'Not a participant in this session');
		}

		const existingVote = await db
			.selectFrom('votes')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('round_id', '=', round.round)
			.where('option_id', '=', Number(optionId))
			.executeTakeFirst();

		if (existingVote) {
			error(400, 'This option has already been vetoed');
		}

		await db
			.insertInto('votes')
			.values({
				user_id: locals.user.id,
				option_id: Number(optionId),
				round_id: round.round,
				session_code: params.code
			})
			.execute();

		const users = await db
			.selectFrom('session_players')
			.select('user_id')
			.where('session_code', '=', params.code)
			.execute();

		const votesThisRound = await db
			.selectFrom('votes')
			.select('user_id')
			.where('session_code', '=', params.code)
			.where('round_id', '=', round.round)
			.execute();

		if (votesThisRound.length >= users.length) {
			const votedOptionIds = await db
				.selectFrom('votes')
				.select('option_id')
				.where('session_code', '=', params.code)
				.where('round_id', '<=', round.round)
				.execute();

			const votedIds = votedOptionIds.map((v) => v.option_id);

			const remainingOptions = await db
				.selectFrom('options')
				.selectAll()
				.where('id', 'not in', votedIds.length > 0 ? votedIds : [-1])
				.execute();

			if (remainingOptions.length === 1) {
				redirect(303, `/${params.code}/win`);
			}

			await db
				.insertInto('rounds')
				.values({
					round: round.round + 1,
					session_code: params.code
				})
				.execute();

			redirect(303, `/${params.code}/${round.round + 1}`);
		}
	}
} satisfies Actions;

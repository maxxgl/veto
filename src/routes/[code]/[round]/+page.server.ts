import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	depends('round:data');

	const roundNum = Number(params.round);
	const [round, allOptions, votesThisRound, previousVotes, users] = await Promise.all([
		db
			.selectFrom('rounds')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('round', '=', roundNum)
			.executeTakeFirst(),
		db.selectFrom('options').selectAll().execute(),
		db
			.selectFrom('votes')
			.innerJoin('users', 'votes.user_id', 'users.id')
			.select(['votes.option_id', 'votes.user_id', 'users.username'])
			.where('session_code', '=', params.code)
			.where('round_id', '=', roundNum)
			.execute(),
		db
			.selectFrom('votes')
			.innerJoin('users', 'votes.user_id', 'users.id')
			.select(['votes.option_id', 'votes.round_id', 'users.username'])
			.where('session_code', '=', params.code)
			.where('round_id', '<', roundNum)
			.execute(),
		db
			.selectFrom('session_players')
			.innerJoin('users', 'session_players.user_id', 'users.id')
			.select(['users.id', 'users.username'])
			.where('session_code', '=', params.code)
			.execute()
	]);

	if (!round) error(404, 'Round not found');

	const previousVotesMap = Object.fromEntries(
		previousVotes.map((v) => [v.option_id, { round: v.round_id, username: v.username }])
	);

	const vetoedOptions = Object.fromEntries(
		votesThisRound.map((v) => [v.option_id, { username: v.username, userId: v.user_id }])
	);

	if (votesThisRound.length >= users.length) {
		const nextRound = await db
			.selectFrom('rounds')
			.selectAll()
			.where('session_code', '=', params.code)
			.where('round', '=', roundNum + 1)
			.executeTakeFirst();

		if (nextRound) redirect(303, `/${params.code}/${nextRound.round}`);
	}

	const hasVoted = votesThisRound.some((v) => v.user_id === locals.user?.id);

	return {
		options: allOptions,
		round,
		isMyTurn: !hasVoted,
		currentPlayerId: locals.user?.id,
		votesThisRound,
		users,
		vetoedOptions,
		previousVotesMap
	};
};

export const actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) error(401, 'Must be logged in to vote');

		const formData = await request.formData();
		const optionId = formData.get('option_id');
		if (!optionId) error(400, 'Missing option_id');

		const roundNum = Number(params.round);
		const [round, isParticipant, existingVote] = await Promise.all([
			db
				.selectFrom('rounds')
				.select(['round', 'session_code'])
				.where('session_code', '=', params.code)
				.where('round', '=', roundNum)
				.executeTakeFirst(),
			db
				.selectFrom('session_players')
				.select('user_id')
				.where('session_code', '=', params.code)
				.where('user_id', '=', locals.user.id)
				.executeTakeFirst(),
			db
				.selectFrom('votes')
				.select('id')
				.where('session_code', '=', params.code)
				.where('round_id', '=', roundNum)
				.where('option_id', '=', Number(optionId))
				.executeTakeFirst()
		]);

		if (!round) error(404, 'Round not found');
		if (!isParticipant) error(403, 'Not a participant in this session');
		if (existingVote) error(400, 'This option has already been vetoed');

		await db
			.insertInto('votes')
			.values({
				user_id: locals.user.id,
				option_id: Number(optionId),
				round_id: roundNum,
				session_code: params.code
			})
			.execute();

		const [playerCount, voteCount] = await Promise.all([
			db
				.selectFrom('session_players')
				.select(db.fn.count('user_id').as('count'))
				.where('session_code', '=', params.code)
				.executeTakeFirstOrThrow(),
			db
				.selectFrom('votes')
				.select(db.fn.count('id').as('count'))
				.where('session_code', '=', params.code)
				.where('round_id', '=', roundNum)
				.executeTakeFirstOrThrow()
		]);

		if (Number(voteCount.count) >= Number(playerCount.count)) {
			const votedIds = await db
				.selectFrom('votes')
				.select('option_id')
				.where('session_code', '=', params.code)
				.where('round_id', '<=', roundNum)
				.execute()
				.then((votes) => votes.map((v) => v.option_id));

			const remainingCount = await db
				.selectFrom('options')
				.select(db.fn.count('id').as('count'))
				.where('id', 'not in', votedIds.length > 0 ? votedIds : [-1])
				.executeTakeFirstOrThrow();

			if (Number(remainingCount.count) > 1) {
				await db
					.insertInto('rounds')
					.values({ round: roundNum + 1, session_code: params.code })
					.execute();

				redirect(303, `/${params.code}/${roundNum + 1}`);
			}
		}
	}
} satisfies Actions;

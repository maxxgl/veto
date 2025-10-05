import type { Actions } from './$types';
import { db } from '$lib';
import { error } from '@sveltejs/kit';

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

	return { options, round };
};

export const actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const optionId = formData.get('option_id');

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
				player_id: session.owner_id,
				option_id: Number(optionId),
				round_id: Number(params.round),
				session_uuid: params.code
			})
			.execute();
	}
} satisfies Actions;

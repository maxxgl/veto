import type { PageServerLoad } from './$types';
import { db } from '$lib';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const session = await db
		.selectFrom('sessions')
		.selectAll()
		.where('code', '=', params.code)
		.executeTakeFirst();

	if (!session) {
		error(404, 'Session not found');
	}

	const votedOptionIds = await db
		.selectFrom('votes')
		.select('option_id')
		.where('session_code', '=', params.code)
		.execute();

	const votedIds = votedOptionIds.map((v) => v.option_id);

	const winningOption = await db
		.selectFrom('options')
		.selectAll()
		.where('session_code', '=', params.code)
		.where('id', 'not in', votedIds.length > 0 ? votedIds : [-1])
		.executeTakeFirst();

	if (!winningOption) {
		error(404, 'No winning option found');
	}

	return {
		winningOption,
		session
	};
};

import type { Actions } from './$types';
import { db } from '$lib';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const options = await db.selectFrom('options').selectAll().execute();

	return { options };
};

export const actions = {
	default: async ({ url, params }) => {
		console.log(params.code);
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

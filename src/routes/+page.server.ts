import type { Actions } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib';

export const actions = {
	join: async ({ request, locals }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString()?.toUpperCase();

		if (!code) {
			error(400, 'Session code is required');
		}

		if (!locals.user) {
			const url = encodeURIComponent('/' + code + '/join');
			throw redirect(303, `/login?redirect=${url}`);
		}

		const session = await db
			.selectFrom('sessions')
			.select('code')
			.where('code', '=', code)
			.executeTakeFirst();

		if (!session) {
			error(404, 'Session not found');
		}

		redirect(303, '/' + code + '/join');
	}
} satisfies Actions;

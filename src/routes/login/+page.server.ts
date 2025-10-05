import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/database';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();
		const password = data.get('password')?.toString();

		if (!username || !password) {
			redirect(303, '/login');
		}

		const user = await db
			.selectFrom('users')
			.select(['id', 'username', 'hashed_password'])
			.where('username', '=', username)
			.executeTakeFirst();

		if (!user || user.hashed_password !== password) {
			redirect(303, '/login');
		}

		const sessionId = crypto.randomUUID();
		const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

		await db
			.insertInto('auth_sessions')
			.values({
				id: sessionId,
				user_id: user.id,
				expires_at: expiresAt
			})
			.execute();

		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});

		redirect(302, '/');
	}
};

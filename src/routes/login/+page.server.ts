import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db, generateShortCode } from '$lib';

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString();

		if (!username) {
			return fail(400, { error: 'Username is required' });
		}

		const deviceToken = crypto.randomUUID();

		const user = await db
			.insertInto('users')
			.values({
				username,
				device_token: deviceToken
			})
			.returning(['id', 'username'])
			.executeTakeFirstOrThrow();

		const sessionId = crypto.randomUUID();
		const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 365;

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
			maxAge: 60 * 60 * 24 * 365
		});

		const action = url.searchParams.get('action');
		const code = url.searchParams.get('code');

		if (action === 'create') {
			let sessionCode: string;

			await db.transaction().execute(async (trx) => {
				sessionCode = await generateShortCode(trx);

				await trx
					.insertInto('sessions')
					.values({
						code: sessionCode,
						gps_lat: 0,
						gps_lng: 0,
						owner_id: user.id
					})
					.execute();

				await trx
					.insertInto('session_players')
					.values({
						session_code: sessionCode,
						user_id: user.id
					})
					.execute();
			});

			redirect(303, '/' + sessionCode!);
		} else if (action === 'join' && code) {
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

		redirect(302, '/');
	}
};

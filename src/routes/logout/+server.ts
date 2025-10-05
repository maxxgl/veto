import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');

	if (sessionId) {
		await db.deleteFrom('auth_sessions').where('id', '=', sessionId).execute();
	}

	cookies.delete('session_id', { path: '/' });

	redirect(302, '/login');
};

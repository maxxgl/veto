import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/database';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session_id');

	if (sessionId) {
		const session = await db
			.selectFrom('auth_sessions')
			.selectAll()
			.where('id', '=', sessionId)
			.where('expires_at', '>', Date.now())
			.executeTakeFirst();

		if (session) {
			const user = await db
				.selectFrom('users')
				.select(['id', 'username'])
				.where('id', '=', session.user_id)
				.executeTakeFirst();

			if (user) {
				event.locals.user = user;
			}
		}
	}

	const publicRoutes = ['/login', '/'];
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname === route);

	if (!event.locals.user && !isPublicRoute) {
		const redirectParam = encodeURIComponent(event.url.pathname + event.url.search);
		redirect(303, `/login?redirect=${redirectParam}`);
	}

	return resolve(event);
};

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.session) {
		redirect(302, '/login');
	}

	// TODO: Invalidate session

	redirect(302, '/login');
};

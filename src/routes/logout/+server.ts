import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
	// TODO: Invalidate session

	redirect(302, '/login');
};

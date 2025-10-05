import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async () => {
		// TODO: Implement signup

		redirect(302, '/');
	}
};

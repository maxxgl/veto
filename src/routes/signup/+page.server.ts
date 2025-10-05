import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// TODO: Implement signup

		redirect(302, '/');
	}
};

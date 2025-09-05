import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

const getNewRoom = () => 'b941d622-5c5f-4cc6-8e23-1d84049dc410';

export const actions = {
	default: async () => {
		const code = getNewRoom();
		redirect(303, '/' + code);
	}
} satisfies Actions;

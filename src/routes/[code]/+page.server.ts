import type { Actions } from './$types';
import { db } from '$lib';

export const load = async ({ params }) => {
	const data = await db
		.selectFrom('sessions')
		.selectAll()
		.where('uuid_code', '=', params.code)
		.execute();

	return { data };
};

export const actions = {
	default: async () => {
		const result = await db
			.insertInto('sessions')
			.values({
				uuid_code: 'b941d622-5c5f-4cc6-8e23-1d84049dc410',
				owner_id: 1,
				gps_lat: 10,
				gps_lng: 10
			})
			.execute();
		console.log(result);
	}
} satisfies Actions;

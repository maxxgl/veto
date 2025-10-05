import { type Tx } from './database';

export * from './database';
export * from './getRestaurantsFromLocation';

export async function generateShortCode(tx: Tx, length = 5): Promise<string> {
	const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
	const maxAttempts = 10;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		let code = '';
		for (let i = 0; i < length; i++) {
			code += chars[Math.floor(Math.random() * chars.length)];
		}

		const existing = await tx
			.selectFrom('sessions')
			.select('code')
			.where('code', '=', code)
			.executeTakeFirst();

		if (!existing) {
			return code;
		}
	}

	throw new Error('Failed to generate unique session code');
}

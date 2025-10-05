export { db } from './database';

export function generateShortCode(length = 5): string {
	const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
	let code = '';
	for (let i = 0; i < length; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

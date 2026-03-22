/** @type {import('./$types').PageLoad} */
export function load() {
	// Glob all +page.js files under tech/*/
	const modules = import.meta.glob('./*/+page.js', { eager: true });

	const posts = Object.entries(modules)
		.filter(([, mod]) => /** @type {any} */ (mod)._metadata)
		.map(([path, mod]) => {
			// "./block-bots/+page.js" → "block-bots"
			const slug = path.split('/')[1];
			return { .../** @type {any} */ (mod)._metadata, slug };
		})
		.filter((p) => !p.draft)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
}

/** @type {import('./$types').PageLoad} */
export function load() {
	const sections = /** @type {const} */ (['tech', 'travel']);
	/** @type {Record<string, number>} */
	const tagCounts = {};

	for (const section of sections) {
		const modules =
			section === 'tech'
				? import.meta.glob('../tech/*/+page.js', { eager: true })
				: import.meta.glob('../travel/*/+page.js', { eager: true });

		for (const [, mod] of Object.entries(modules)) {
			const meta = /** @type {any} */ (mod)._metadata;
			if (!meta || meta.draft) continue;
			for (const tag of meta.tags || []) {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			}
		}
	}

	const tags = Object.entries(tagCounts)
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

	return { tags };
}

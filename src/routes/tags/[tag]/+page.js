/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const { tag } = params;

	/** @type {Array<{title: string, date: string, slug: string, section: string, tags: string[]}>} */
	const posts = [];

	const techModules = import.meta.glob('../../tech/*/+page.js', { eager: true });
	for (const [path, mod] of Object.entries(techModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		if ((meta.tags || []).includes(tag)) {
			const slug = path.split('/').at(-2);
			posts.push({ ...meta, slug, section: 'tech' });
		}
	}

	const travelModules = import.meta.glob('../../travel/*/+page.js', { eager: true });
	for (const [path, mod] of Object.entries(travelModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		if ((meta.tags || []).includes(tag)) {
			const slug = path.split('/').at(-2);
			posts.push({ ...meta, slug, section: 'travel' });
		}
	}

	posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { tag, posts };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	const tags = new Set();

	const techModules = import.meta.glob('../../tech/*/+page.js', { eager: true });
	for (const [, mod] of Object.entries(techModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		for (const t of meta.tags || []) tags.add(t);
	}

	const travelModules = import.meta.glob('../../travel/*/+page.js', { eager: true });
	for (const [, mod] of Object.entries(travelModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		for (const t of meta.tags || []) tags.add(t);
	}

	return [...tags].map((tag) => ({ tag }));
}

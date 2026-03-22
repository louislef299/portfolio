const SITE = 'https://louislefebvre.net';

/** @type {import('./$types').RequestHandler} */
export function GET() {
	const techModules = import.meta.glob('../tech/*/+page.js', { eager: true });
	const travelModules = import.meta.glob('../travel/*/+page.js', { eager: true });

	/** @type {Array<{url: string, date?: string}>} */
	const pages = [
		{ url: '/' },
		{ url: '/tech/' },
		{ url: '/travel/' },
		{ url: '/misc/' },
		{ url: '/tags/' }
	];

	for (const [path, mod] of Object.entries(techModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		const slug = path.split('/').at(-2);
		pages.push({ url: `/tech/${slug}/`, date: meta.date });
	}

	for (const [path, mod] of Object.entries(travelModules)) {
		const meta = /** @type {any} */ (mod)._metadata;
		if (!meta || meta.draft) continue;
		const slug = path.split('/').at(-2);
		pages.push({ url: `/travel/${slug}/`, date: meta.date });
	}

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(p) => `  <url>
    <loc>${SITE}${p.url}</loc>${p.date ? `\n    <lastmod>${p.date}</lastmod>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
}

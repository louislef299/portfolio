import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { createHighlighter } from 'shiki';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.md'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await createHighlighter({
				themes: ['github-dark'],
				langs: [lang]
			});
			const html = highlighter.codeToHtml(code, { lang, theme: 'github-dark' });
			highlighter.dispose();
			return `{@html \`${html.replace(/`/g, '\\`')}\`}`;
		}
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [mdsvex(mdsvexOptions)],
	kit: {
		adapter: adapter({
			fallback: undefined
		}),
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;

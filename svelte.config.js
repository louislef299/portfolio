import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
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

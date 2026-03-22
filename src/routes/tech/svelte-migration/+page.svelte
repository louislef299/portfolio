<script>
	import Seo from '$lib/components/Seo.svelte';
	import { _metadata as metadata } from './+page.js';
</script>

<Seo title={metadata.title} keywords={metadata.tags} />

<h1>{metadata.title}</h1>
<p class="byline">
	<time datetime={metadata.date}>{metadata.date}</time>
</p>

<content>
	<p>
		Personal reference for migrating louislefebvre.net from Hugo to SvelteKit. This is a living
		document — see <code>content/tech/svelte-migration.md</code> in the repo for the full version
		with implementation notes and gotchas.
	</p>

	<p><em>This post is a draft and not published on the live site.</em></p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>

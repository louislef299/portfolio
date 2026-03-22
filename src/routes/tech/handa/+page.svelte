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
		I've been working with my Dad(Tony) a lot to get the Little Bitta ecommerce site up and running
		and successfully got <a href="https://hammer-anvil.com">hammer-anvil.com</a> up and running over
		the weekend. It's a simple site and we got design inspiration from
		<a href="https://www.lovefrom.com/">lovefrom.com</a>(thanks Jony) and
		<em><a href="https://en.wikipedia.org/wiki/Ma_(negative_space)">Ma</a></em>. Simple yet
		effective design that prioritizes mobile-first CSS principals. Details to come on that front, but
		it has been pretty exciting bootstrapping Hammer &amp; Anvil Web Services.
	</p>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>

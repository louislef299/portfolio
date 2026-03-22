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
		So I've marked up a little map to identify where I've been and about when. It doesn't cover
		everything, but it at least covers the basics of where I've been. A few tropical areas, lots of
		mountains, across the pond, all over. Very grateful to have the opportunity to travel so much.
	</p>

	<p>
		One of the most impactful trips that I actually took good notes on was my California trip last
		year(2023). It was just me that went, but I was pretty much in between San Francisco and Los
		Angeles the whole time bumming around and surfing. It was a blast! Luckily I got so bored that I
		started noting
		<a href="https://maps.app.goo.gl/hqKRLNXjLXdGLLt17">where I went on Google Maps</a>.
	</p>

	<iframe
		src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3305052.3967116196!2d-123.45765684999998!3d36.005877678075464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1735578692655!5m2!1sen!2sus"
		width="400"
		height="300"
		style="border:0;"
		allowfullscreen=""
		loading="lazy"
		referrerpolicy="no-referrer-when-downgrade"
		title="California 2023 Trip Map"
	></iframe>

	<p>
		Other than that, some spring breaks, family trips and a study abroad were all sprinkled in
		there. Currently, I've been watching Stoney Point up in the North Shore on Lake Superior and have
		been hoping to surf it this winter. I'll be sure to write up a post if I do that and maybe even
		get some pictures.
	</p>

	<p>
		As much as I love traveling, I wouldn't say I enjoy it to just lay around and relax. Sure I
		enjoy that every once in a while, but I more prefer the long road trips across the country, wild
		backpacking camps up north, searching for the best breaks on the coasts, or getting wind burn
		after summiting a mountain.
	</p>

	<p>
		Anyways, I'll try to write up blog posts about that places I've been, some of the best
		restaurants I hit or some things that I did. I'm not going to go over any of my previous trips
		more than marking them on the map, but I'll try to write about them a bit.
	</p>

	<img
		src="/image/travel/welcome/henry-chillin-north-shore.jpg"
		alt="Henry chillin on the North Shore"
		loading="lazy"
	/>
</content>

<p>
	{#each metadata.tags as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</p>

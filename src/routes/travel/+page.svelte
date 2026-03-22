<script>
	import Seo from '$lib/components/Seo.svelte';
	import TravelMap from '$lib/components/TravelMap.svelte';

	let { data } = $props();
</script>

<Seo title="Travel" description="Travel posts and map of places I've visited" />

<h1>Travel</h1>

<TravelMap />

<p>
	Above, I listed most of the major trips that I've been on. For a while, I was really against
	social media and posting any pictures about my life online, but I decided to start documenting my
	travels on vsco.
</p>

<ul class="blog-posts">
	{#each data.posts as post}
		<li>
			<span>
				<i>
					<time datetime={new Date(post.date).toISOString().slice(0, 10)}>
						{new Date(post.date).toISOString().slice(0, 10)}
					</time>
				</i>
			</span>
			<a href="/travel/{post.slug}/">{post.title}</a>
		</li>
	{:else}
		<li>No posts found.</li>
	{/each}
</ul>

<div>
	{#each [...new Set(data.posts.flatMap((p) => p.tags || []))] as tag}
		<a class="blog-tags" href="/tags/{tag}/">#{tag}</a>
	{/each}
</div>

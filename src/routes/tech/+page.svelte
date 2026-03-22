<script>
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo title="Tech" description="Technical blog posts and experiments" />

<h1>Tech</h1>

<p>
	This mostly just serves as a linear log of my experiments that I use as a personal reference. If
	they help you, great! Not sure where to start? Check out the different <a href="/tags/">Tags</a>.
</p>

<p>
	Technologically, I like researching <a href="https://docs.docker.com/build/bake/"
		>container systems</a
	>,
	<a href="https://ziglang.org/">os programming</a>, cloud architecture(search for
	<em>Large-scale indexing system for ITER data handling</em>),
	<a href="https://www.wireguard.com/">wireguard-based networking</a>
	and <a href="https://ollama.com/">agentic programming</a>. You can find most of my tech projects on
	<a href="https://github.com/louislef299">my Github</a> and I try to blog when I find myself with free
	time.
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
			{#if post.link}
				<a href={post.link} target="_blank">{post.title} ↪</a>
			{:else}
				<a href="/tech/{post.slug}/">{post.title}</a>
			{/if}
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

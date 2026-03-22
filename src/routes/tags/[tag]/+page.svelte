<script>
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo title="#{data.tag}" description="Posts tagged with {data.tag}" />

<h1>#{data.tag}</h1>

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
			<a href="/{post.section}/{post.slug}/">{post.title}</a>
		</li>
	{:else}
		<li>No posts found.</li>
	{/each}
</ul>

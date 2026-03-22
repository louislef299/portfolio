<script>
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();
</script>

<Seo title="Tags" description="Browse posts by tag" />

<h1>Tags</h1>

<div>
	{#each data.tags as { tag, count }}
		<a class="blog-tags" href="/tags/{tag}/">#{tag} ({count})</a>
	{/each}
</div>

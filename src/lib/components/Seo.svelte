<script lang="ts">
	import { site } from '$lib/config';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string[];
	}

	let { title, description, keywords = [] }: Props = $props();

	const pageTitle = $derived(title ? `${title} | ${site.title}` : site.title);
	const pageDescription = $derived(description || site.description);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="title" content={pageTitle} />
	<meta name="description" content={pageDescription} />
	<meta name="author" content={site.author.name} />
	{#if keywords.length > 0}
		<meta name="keywords" content={keywords.join(',')} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:site_name" content={site.title} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
</svelte:head>

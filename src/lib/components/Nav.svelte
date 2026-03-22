<script lang="ts">
	import { site } from '$lib/config';
</script>

<a class="skip-link" href="#main-content">Skip to main content</a>

<a href="/" class="title"><h1>{site.title}</h1></a>
<nav>
	{#each site.menu as item}
		<a href={item.url}>{item.name}</a>
	{/each}
</nav>

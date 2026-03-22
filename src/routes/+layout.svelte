<script>
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { children } = $props();
</script>

<Seo />

<header>
	<Nav />
</header>

<main id="main-content">
	{@render children()}
</main>

<footer>
	<Footer />
</footer>

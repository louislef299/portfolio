<script lang="ts">
	import { onMount } from 'svelte';
	import { site } from '$lib/config';

	let bmcLoaded = $state(false);

	onMount(() => {
		// Load Buy Me a Coffee script
		const script = document.createElement('script');
		script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
		script.setAttribute('data-name', 'bmc-button');
		script.setAttribute('data-slug', 'louislef299');
		script.setAttribute('data-color', '#40DCA5');
		script.setAttribute('data-emoji', '');
		script.setAttribute('data-font', 'Cookie');
		script.setAttribute('data-text', 'Buy me a coffee');
		script.setAttribute('data-outline-color', '#000000');
		script.setAttribute('data-font-color', '#000000');
		script.setAttribute('data-coffee-color', '#FFDD00');
		script.onload = () => (bmcLoaded = true);
		document.body.appendChild(script);
	});
</script>

<hr />

<small>{site.copyright} | Made with <a href="https://kit.svelte.dev">SvelteKit</a></small>

<div class="git-update" style="opacity: 0.5; padding-top: 0.75rem">
	<small>
		<i>
			Built from commit
			<a href="{site.repo}/commit/{__GIT_HASH__}">{__GIT_HASH__}</a>
		</i>
	</small>
</div>

<!-- Social media icons -->
<div class="footer-social-icons" style="opacity: 0.75; padding-top: 1rem">
	<a href="https://linkedin.com/in/louislef299" target="_blank" rel="noopener noreferrer">
		<img src="/image/svgs/brands/linkedin.svg" alt="linkedin" />
	</a>
	<a href="https://github.com/louislef299" target="_blank" rel="noopener noreferrer">
		<img src="/image/svgs/brands/github.svg" alt="gitHub" />
	</a>
	<a
		href="https://open.spotify.com/user/lefavorite?si=ac8f2ce91f62475c"
		target="_blank"
		rel="noopener noreferrer"
	>
		<img src="/image/svgs/brands/spotify.svg" alt="spotify" />
	</a>
</div>

<style>
	.bmc-div :global(.bmc-btn-container) {
		transform: scale(0.6);
	}
</style>

<div class="bmc-div" style="opacity: 0.75"></div>

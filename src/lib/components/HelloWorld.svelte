<script>
	let { name = 'World' } = $props();
	let count = $state(0);
</script>

<div class="hello">
	<p>Hello, {name}!</p>
	<button onclick={() => count++}>
		Clicked {count} {count === 1 ? 'time' : 'times'}
	</button>
</div>

<style>
	.hello {
		font-family: inherit;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		display: inline-block;
	}
	button {
		cursor: pointer;
		padding: 0.25rem 0.75rem;
		margin-top: 0.5rem;
	}
</style>

<!--
  Sample web component to prove the Svelte-in-Hugo pipeline works.
  Delete this file (and its import in main.ts) once you've built real components.

  Usage in Hugo markdown:
    {{</* hello-world */>}}
    {{</* hello-world name="Louis" */>}}
-->
<svelte:options customElement="hello-world" />

<script lang="ts">
  // Svelte 5 runes: $props() declares component attributes,
  // $state() declares reactive local state.
  let { name = "World" } = $props();
  let count = $state(0);
</script>

<div class="hello">
  <p>Hello, {name}!</p>
  <button onclick={() => count++}>
    Clicked {count} {count === 1 ? "time" : "times"}
  </button>
</div>

<!-- Styles are scoped to this component's Shadow DOM —
     they won't leak into or inherit from the Hugo theme. -->
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

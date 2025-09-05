<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex gap-2">
	<div>x</div>
	<nav><span>Home</span></nav>
</header>

<div>{@render children?.()}</div>

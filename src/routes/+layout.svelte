<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar bg-base-100 border-b border-base-300 p-2 min-h-0">
	<div class="navbar-start">
		<a href={resolve('/')} class="text-xl px-2">VETO</a>
	</div>
	<div class="navbar-end">
		<nav class="flex gap-4">
			<a href={resolve('/')} class="btn btn-ghost btn-sm">Home</a>
			{#if data.user}
				<span class="btn btn-ghost btn-sm no-animation">{data.user.username}</span>
			{/if}
		</nav>
	</div>
</header>

<main class="container mx-auto px-4 py-2 h-full grid grid-rows-[min-content_min-content_1fr]">
	{@render children?.()}
</main>

<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar bg-base-100 border-b border-base-300">
	<div class="navbar-start">
		<a href={resolve('/')} class="text-xl font-bold">Last X Standing</a>
	</div>
	<div class="navbar-end">
		<nav class="flex gap-4">
			<a href={resolve('/')} class="btn btn-ghost btn-sm">Home</a>
			{#if !data.user}
				<a href={resolve('/login')} class="btn btn-ghost btn-sm">Login</a>
				<a href={resolve('/signup')} class="btn btn-ghost btn-sm">Sign Up</a>
			{:else}
				<a href={resolve('/logout')} class="btn btn-ghost btn-sm">Logout</a>
			{/if}
		</nav>
	</div>
</header>

<main class="container mx-auto px-4 py-8">
	{@render children?.()}
</main>

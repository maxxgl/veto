<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar bg-base-100 border-b border-base-300">
	<div class="navbar-start">
		<a href="/" class="text-xl font-bold">Last X Standing</a>
	</div>
	<div class="navbar-end">
		<nav class="flex gap-4">
			<a href="/" class="btn btn-ghost btn-sm">Home</a>
			<a href="/login" class="btn btn-ghost btn-sm">Login</a>
			<a href="/signup" class="btn btn-ghost btn-sm">Sign Up</a>
		</nav>
	</div>
</header>

<main class="container mx-auto px-4 py-8">
	{@render children?.()}
</main>

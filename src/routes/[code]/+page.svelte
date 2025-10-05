<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto, invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();
	// console.log(data, form);

	let isOwner = $derived(data.currentUser?.id === data.session.owner_id);

	let pollInterval: ReturnType<typeof setInterval>;
	let copied = $state(false);

	onMount(() => {
		pollInterval = setInterval(async () => {
			await invalidate('session:data');
		}, 2000);
	});

	onDestroy(() => {
		clearInterval(pollInterval);
	});

	$effect(() => {
		if (data.currentRound) {
			goto(resolve(`/${params.code}/${data.currentRound}`), { replaceState: true });
		}
	});

	async function copyCode() {
		await navigator.clipboard.writeText(params.code);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="flex justify-between mb-4">
	<div>
		<div class="text-2xl font-bold mb-2">Session</div>
		<div class="flex items-center gap-2">
			<div class="text-sm opacity-70">Code: {params.code}</div>
			<button onclick={copyCode} class="btn btn-xs btn-ghost">
				{copied ? 'Copied!' : 'Copy'}
			</button>
		</div>
	</div>

	{#if isOwner}
		<form method="POST" action="?/start">
			<button class="btn btn-primary mt-4">Start</button>
		</form>
	{/if}
</div>

{#if data.currentUser && !data.isParticipant}
	<div class="alert alert-warning mb-4">
		<span>You are not yet a participant in this session.</span>
		<a
			href={resolve(`/${params.code}/join`)}
			class="btn btn-sm btn-primary"
			data-sveltekit-preload-data
		>
			Join Session
		</a>
	</div>
{:else if !data.currentUser}
	<div class="alert alert-info mb-4">
		<span>Log in to join this session.</span>
		<a
			href={resolve(`/login?redirect=/${params.code}/join`)}
			class="btn btn-sm btn-primary"
			data-sveltekit-preload-data
		>
			Log In
		</a>
	</div>
{/if}

{#each data.options as x (x.id)}
	<div class="py-2">
		<div class="flex">
			<span class="font-bold">{x.name}</span>: {x.description}
			<span class="ml-auto uppercase">{x.cuisine}</span>
		</div>
		<div class="flex">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={x.website} data-sveltekit-reload target="_blank" rel="noopener noreferrer">
				{x.website}
			</a>
			<span class="ml-auto">{x.gps_lat}, {x.gps_lng}</span>
		</div>
	</div>
{/each}

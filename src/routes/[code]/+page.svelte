<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto, invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();
	// console.log(data, form);

	let isOwner = $derived(data.currentUser?.id === data.session.owner_id);

	let pollInterval: ReturnType<typeof setInterval>;

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
			goto(resolve(`/${params.code}/voting`), { replaceState: true });
		}
	});
</script>

{#if isOwner}
	<div class="flex justify-end mb-4">
		<form method="POST" action="?/start">
			<button class="btn btn-primary">Start</button>
		</form>
	</div>
{/if}

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
	<div class="py-4 flex justify-between items-center gap-8">
		<div class="flex-1">
			<div class="flex">
				<span class="font-bold">{x.name}</span>: {x.description}
				<span class="ml-auto">{x.cuisine}</span>
			</div>
			<div class="flex">
				{x.description} <span class="ml-auto">{x.gps_lat}, {x.gps_lng}</span>
			</div>
		</div>
	</div>
{/each}

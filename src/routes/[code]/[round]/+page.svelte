<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	let { data, params, form }: PageProps = $props();
	console.log(data, form);

	let pollInterval: ReturnType<typeof setInterval>;

	onMount(() => {
		pollInterval = setInterval(() => {
			invalidate('round:data');
		}, 2000);
	});

	onDestroy(() => {
		clearInterval(pollInterval);
	});
</script>

<div class="mb-8">
	<div class="text-sm opacity-70">{params.code}</div>
	<div class="text-2xl font-bold">Round {data.round.round}</div>
</div>

{#if data.isMyTurn}
	<div class="alert alert-info mb-4">
		<span>It's your turn! Eliminate an option below.</span>
	</div>
{:else}
	<div class="alert mb-4">
		<span>Waiting for other players to vote...</span>
	</div>
{/if}

<form class="mb-8 mx-auto" method="POST" action="?/addUser">
	<button class="btn btn-neutral mt-4">add a user</button>
</form>

{#each data.options as x (x.id)}
	<div class="py-4 flex justify-between items-center gap-8">
		<div class="flex-1">
			<div class="flex">
				<span class="font-bold">{x.name}</span>: {x.description}
				<span class="ml-auto uppercase">{x.genre}</span>
			</div>
			<div class="flex">
				{x.description} <span class="ml-auto">{x.gps_lat}, {x.gps_lng}</span>
			</div>
		</div>
		<form method="POST">
			<input type="hidden" name="option_id" value={x.id} />
			<button class="btn btn-error btn-outline" disabled={!data.isMyTurn}>Eliminate</button>
		</form>
	</div>
{/each}

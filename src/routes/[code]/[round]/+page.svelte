<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import { enhance } from '$app/forms';

	let { data, params, form }: PageProps = $props();
	console.log(data, form);

	const sortedOptions = $derived.by(() => {
		const active = data.options.filter(
			(opt) => !data.previousVotesMap[opt.id] && !data.vetoedOptions[opt.id]
		);
		const vetoed = data.options
			.filter((opt) => data.previousVotesMap[opt.id] || data.vetoedOptions[opt.id])
			.sort((a, b) => {
				const aRound = data.previousVotesMap[a.id]?.round ?? data.round.round;
				const bRound = data.previousVotesMap[b.id]?.round ?? data.round.round;
				return aRound - bRound;
			});
		return [...active, ...vetoed];
	});

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

{#each sortedOptions as x (x.id)}
	{@const isVetoedThisRound = data.vetoedOptions[x.id]}
	{@const isVetoedPrevious = data.previousVotesMap[x.id]}
	{@const isVetoed = isVetoedThisRound || isVetoedPrevious}
	<div
		class="py-4 flex justify-between items-center gap-8"
		class:opacity-50={isVetoed}
		animate:flip={{ duration: 400 }}
	>
		<div class="flex-1">
			<div class="flex">
				<span class="font-bold">{x.name}</span>: {x.description}
				<span class="ml-auto uppercase">{x.genre}</span>
			</div>
			<div class="flex">
				{x.description} <span class="ml-auto">{x.gps_lat}, {x.gps_lng}</span>
			</div>
		</div>
		{#if isVetoed}
			<div class="flex items-center gap-2">
				<span class="text-sm"
					>Vetoed by {isVetoedThisRound?.username ?? isVetoedPrevious?.username}</span
				>
				<button class="btn btn-error btn-outline" disabled>Eliminate</button>
			</div>
		{:else}
			<form method="POST" use:enhance>
				<input type="hidden" name="option_id" value={x.id} />
				<button class="btn btn-error btn-outline" disabled={!data.isMyTurn}>Eliminate</button>
			</form>
		{/if}
	</div>
{/each}

<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidate } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import { enhance } from '$app/forms';

	let { data, form }: PageProps = $props();
	// console.log(data, form);

	const sortedOptions = $derived.by(() => {
		const activeOrVetoedThisRound = data.options.filter((opt) => !data.previousVotesMap[opt.id]);
		const vetoedPrevious = data.options
			.filter((opt) => data.previousVotesMap[opt.id])
			.sort((a, b) => {
				const aRound = data.previousVotesMap[a.id]?.round ?? data.round.round;
				const bRound = data.previousVotesMap[b.id]?.round ?? data.round.round;
				return bRound - aRound;
			});
		return [...activeOrVetoedThisRound, ...vetoedPrevious];
	});

	const winningOption = $derived.by(() => {
		const active = sortedOptions.filter(
			(opt) => !data.previousVotesMap[opt.id] && !data.vetoedOptions[opt.id]
		);
		return active.length === 1 ? active[0] : null;
	});

	let showConfetti = $state(false);
	let confettiPieces = $state(
		Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			delay: Math.random() * 3,
			duration: 3 + Math.random() * 2,
			color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'][
				Math.floor(Math.random() * 6)
			]
		}))
	);

	$effect(() => {
		if (winningOption) {
			showConfetti = true;
			clearInterval(pollInterval);
			setTimeout(() => {
				showConfetti = false;
			}, 6000);
		}
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

{#if form?.warning}
	<div class="toast toast-top toast-center z-50">
		<div class="alert alert-warning">
			<span>{form.warning}</span>
		</div>
	</div>
{/if}

{#if !winningOption}
	{#if data.isMyTurn}
		<div class="alert alert-info mb-4 flex justify-between">
			<span>It's your turn!</span>
			<div>
				<span class="font-bold">Round {data.round.round}, </span>
				<span>
					{Math.ceil(
						(data.options.length - data.round.round * data.participants.length) /
							data.participants.length
					)}
					to go
				</span>
			</div>
		</div>
	{:else}
		<div class="alert mb-4 flex justify-between">
			<span>Waiting for other players to vote...</span>
			<div>
				<span class="font-bold">Round {data.round.round}, </span>
				<span>
					{Math.ceil(
						(data.options.length - data.round.round * data.participants.length) /
							data.participants.length
					)}
					to go
				</span>
			</div>
		</div>
	{/if}
{/if}

{#if showConfetti}
	<div class="fixed inset-0 overflow-hidden pointer-events-none z-[500]">
		{#each confettiPieces as piece (piece.id)}
			<div
				class="absolute w-2 h-2 animate-fall"
				style="left: {piece.left}%; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; background-color: {piece.color};"
			></div>
		{/each}
	</div>
{/if}

<div class="h-full overflow-y-auto">
	{#each sortedOptions as x (x.id)}
		{@const isVetoedThisRound = data.vetoedOptions[x.id]}
		{@const isVetoedPrevious = data.previousVotesMap[x.id]}
		{@const isVetoed = isVetoedThisRound || isVetoedPrevious}
		{@const isWinner = winningOption?.id === x.id}
		<div
			class="py-2 flex justify-between items-center gap-8 transition-all duration-500 border-y-1 border-neutral-700"
			class:opacity-50={isVetoed}
			class:winner-expanded={isWinner}
			animate:flip={{ duration: 1000 }}
		>
			<div class="flex-1">
				{#if x.website}
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={x.website}
						class="link max-w-fit"
						data-sveltekit-reload
						target="_blank"
						rel="noopener noreferrer"
					>
						{x.name}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{:else}
					<span>{x.name}</span>
				{/if}
				{#if x.drivingTimeMinutes}
					<span class="text-gray-400 ml-2">{x.drivingTimeMinutes} min</span>
				{/if}
				<div>
					{#if x.cuisine}
						{String(x.cuisine).charAt(0).toUpperCase() + String(x.cuisine).slice(1)}
					{:else}
						<span class="text-gray-600">—</span>
					{/if}
				</div>
			</div>
			{#if isVetoed}
				<span class="text-sm">
					<div>Veto'd by {isVetoedThisRound?.username ?? isVetoedPrevious?.username}</div>
					<div>In Round {isVetoedPrevious?.round ?? data.round.round}</div>
				</span>
			{:else if isWinner}
				<button class="btn btn-success">Winner!</button>
			{:else}
				<form method="POST" use:enhance>
					<input type="hidden" name="option_id" value={x.id} />
					<input type="hidden" name="round_num" value={data.round.round} />
					<button class="btn btn-sm btn-error btn-outline" disabled={!data.isMyTurn}>VETO</button>
				</form>
			{/if}
		</div>
	{/each}
</div>

<style>
	.winner-expanded {
		font-size: 1.2em;
		font-weight: bold;
		padding-top: 1em;
		padding-bottom: 1em;
	}

	@keyframes fall {
		0% {
			transform: translateY(-100vh) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translateY(100vh) rotate(720deg);
			opacity: 0;
		}
	}

	.animate-fall {
		animation: fall linear infinite;
	}
</style>

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

	let showWinner = $state(false);
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
			showWinner = true;
			showConfetti = true;
			clearInterval(pollInterval);
			setTimeout(() => {
				showConfetti = false;
			}, 3000);
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
		<div class="alert alert-info mb-4">
			<span>It's your turn! Veto an option below.</span>
		</div>
	{:else}
		<div class="alert mb-4">
			<span>Waiting for other players to vote...</span>
		</div>
	{/if}
{/if}

{#if showWinner && winningOption}
	<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"></div>
	{#if showConfetti}
		<div class="fixed inset-0 overflow-hidden pointer-events-none z-50">
			{#each confettiPieces as piece (piece.id)}
				<div
					class="absolute w-2 h-2 animate-fall"
					style="left: {piece.left}%; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; background-color: {piece.color};"
				></div>
			{/each}
		</div>
	{/if}
{/if}

<div class="h-full overflow-x-auto">
	{#each sortedOptions as x (x.id)}
		{@const isVetoedThisRound = data.vetoedOptions[x.id]}
		{@const isVetoedPrevious = data.previousVotesMap[x.id]}
		{@const isVetoed = isVetoedThisRound || isVetoedPrevious}
		{@const isWinner = winningOption?.id === x.id}
		<div
			class="py-4 flex justify-between items-center gap-8 transition-all duration-500 border-y-1 border-neutral-700"
			class:opacity-50={isVetoed}
			class:winner-expanded={showWinner && isWinner}
			animate:flip={{ duration: 1000 }}
		>
			{#if isWinner && showWinner}
				<div class="winner-content z-20">
					<button
						class="absolute top-4 right-4 btn btn-sm btn-circle"
						onclick={() => (showWinner = false)}
					>
						✕
					</button>

					<div class="text-center mb-8">
						<div class="text-6xl mb-4 animate-pulse">🎉</div>
						<h1 class="text-5xl font-bold mb-2">We Have a Winner!</h1>
					</div>

					<div class="text-center">
						<h2 class="text-4xl font-bold mb-4">{x.name}</h2>

						{#if x.rating}
							<div class="text-2xl mb-2">⭐ {x.rating}/5</div>
						{/if}

						{#if x.cuisine}
							<div class="badge badge-primary badge-lg mb-4">{x.cuisine}</div>
						{/if}

						{#if x.description}
							<p class="text-lg opacity-80 mb-4">{x.description}</p>
						{/if}

						{#if x.gps_lat && x.gps_lng}
							<div class="text-sm opacity-60">📍 {x.gps_lat}, {x.gps_lng}</div>
						{/if}
					</div>
				</div>
			{:else}
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
						<div>{x.name}</div>
					{/if}
					<div class="flex justify-between">
						<div>{x.cuisine}</div>
						{#if x.drivingTimeMinutes}
							<div class="text-gray-400">{x.drivingTimeMinutes} min</div>
						{/if}
					</div>
				</div>
				{#if isVetoed}
					<span class="text-sm">
						<div>Veto'd by {isVetoedThisRound?.username ?? isVetoedPrevious?.username}</div>
						<div class="text-center">(Round {isVetoedPrevious?.round ?? data.round.round})</div>
					</span>
				{:else if isWinner}
					<button class="btn btn-success">Winner!</button>
				{:else}
					<form method="POST" use:enhance>
						<input type="hidden" name="option_id" value={x.id} />
						<button class="btn btn-error btn-outline btn-sm" disabled={!data.isMyTurn}>VETO</button>
					</form>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.winner-expanded {
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: 90vw !important;
		max-width: 48rem !important;
		height: auto !important;
		min-height: 60vh !important;
		background: hsl(var(--b2)) !important;
		border-radius: 1rem !important;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
		padding: 2rem !important;
		z-index: 50 !important;
		opacity: 1 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		animation: expand-winner 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
	}

	.winner-content {
		width: 100%;
		animation: fade-in 0.5s ease-out 0.3s both;
	}

	@keyframes expand-winner {
		0% {
			transform: translate(-50%, -50%) scale(0.3);
			opacity: 0;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.05);
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
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

	.animate-fade-in {
		animation: fade-in 0.4s ease-out;
	}
</style>

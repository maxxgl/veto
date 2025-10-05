<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

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
</script>

<div class="relative min-h-screen flex items-center justify-center overflow-hidden">
	<div class="absolute inset-0 pointer-events-none">
		{#each confettiPieces as piece (piece.id)}
			<div
				class="absolute w-2 h-2 animate-fall"
				style="left: {piece.left}%; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; background-color: {piece.color};"
			></div>
		{/each}
	</div>

	<div class="text-center z-10 animate-bounce-in">
		<div class="text-6xl mb-8 animate-pulse">🎉</div>

		<h1 class="text-5xl font-bold mb-4">We Have a Winner!</h1>

		<div class="card bg-base-200 shadow-2xl max-w-2xl mx-auto mt-8 animate-scale-in">
			<div class="card-body">
				<h2 class="card-title text-4xl justify-center mb-4">{data.winningOption.name}</h2>

				{#if data.winningOption.rating}
					<div class="text-2xl mb-2">⭐ {data.winningOption.rating}/5</div>
				{/if}

				{#if data.winningOption.genre}
					<div class="badge badge-primary badge-lg mb-4">{data.winningOption.genre}</div>
				{/if}

				{#if data.winningOption.description}
					<p class="text-lg opacity-80 mb-4">{data.winningOption.description}</p>
				{/if}

				{#if data.winningOption.gps_lat && data.winningOption.gps_lng}
					<div class="text-sm opacity-60">
						📍 {data.winningOption.gps_lat}, {data.winningOption.gps_lng}
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-8 space-x-4">
			<a href={resolve('/[code]', { code: data.session.uuid })} class="btn btn-primary"
				>New Session</a
			>
		</div>
	</div>
</div>

<style>
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

	@keyframes bounce-in {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes scale-in {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-fall {
		animation: fall linear infinite;
	}

	.animate-bounce-in {
		animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	.animate-scale-in {
		animation: scale-in 0.5s ease-out 0.3s both;
	}
</style>

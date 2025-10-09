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

<div class="card bg-base-200">
	<div class="card-body">
		<h2 class="card-title">We're gonna figure out where to eat.</h2>
		<div class="steps steps-vertical lg:steps-horizontal">
			<div class="step step-primary">Join the session and wait for voting to start</div>
			<div class="step step-primary">Veto the option you DON'T want</div>
			<div class="step step-primary">Wait for everyone else to do the same</div>
			<div class="step step-primary">Repeat</div>
			<div class="step step-primary">Last option alive wins</div>
		</div>
	</div>
</div>

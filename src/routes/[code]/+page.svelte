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

<div class="prose max-w-none">
	<h2>How Veto Works</h2>
	<ol>
		<li><strong>Join the session</strong> — All participants join using this session code.</li>
		<li>
			<strong>Start voting</strong> — The session owner starts the session to begin voting rounds.
		</li>
		<li>
			<strong>Vote to veto</strong> — Each round, everyone votes on options they want to eliminate.
		</li>
		<li>
			<strong>Consensus wins</strong> — When only one option remains, that's your group's choice!
		</li>
	</ol>
</div>

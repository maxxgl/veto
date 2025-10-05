<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="max-w-2xl mx-auto">
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Join Session</h1>
		<div class="text-sm opacity-70">Code: {data.session.code}</div>
	</div>

	<div class="card bg-base-200 mb-8">
		<div class="card-body">
			<h2 class="card-title">Session Info</h2>
			<div class="space-y-2">
				<div>
					<span class="font-semibold">Location:</span>
					{data.session.gps_lat}, {data.session.gps_lng}
				</div>
				<div>
					<span class="font-semibold">Current Participants:</span>
					{data.participants.length}
				</div>
			</div>
		</div>
	</div>

	{#if data.participants.length > 0}
		<div class="mb-8">
			<h3 class="text-lg font-semibold mb-3">Participants</h3>
			<div class="space-y-2">
				{#each data.participants as participant (participant.id)}
					<div class="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
						<div class="avatar placeholder">
							<div
								class="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center"
							>
								<span class="text-xs">{participant.username[0].toUpperCase()}</span>
							</div>
						</div>
						<span>{participant.username}</span>
						{#if participant.isOwner}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 ml-auto"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"
								/>
							</svg>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<form method="POST" class="card bg-primary text-primary-content">
		<div class="card-body">
			<h3 class="card-title">Ready to join?</h3>
			<p class="opacity-90">
				You'll join as <strong>{data.currentUser.username}</strong> and participate in the veto rounds.
			</p>
			<div class="card-actions justify-end mt-4">
				<a
					href={resolve(`/${data.session.code}`)}
					class="btn btn-ghost"
					data-sveltekit-preload-data
				>
					Cancel
				</a>
				<button type="submit" class="btn btn-secondary">Join Session</button>
			</div>
		</div>
	</form>
</div>

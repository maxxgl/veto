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
							<div class="ml-auto flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							</div>
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

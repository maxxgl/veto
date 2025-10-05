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

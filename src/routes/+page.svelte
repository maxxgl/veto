<script lang="ts">
	let joinCode = $state('');
	let latitude = $state<number | null>(null);
	let longitude = $state<number | null>(null);
	let locationRequested = $state(false);

	function requestLocation() {
		if (navigator.geolocation) {
			locationRequested = true;
			navigator.geolocation.getCurrentPosition(
				(position) => {
					latitude = position.coords.latitude;
					longitude = position.coords.longitude;
				},
				(error) => {
					console.error('Error getting location:', error);
					locationRequested = false;
				}
			);
		}
	}

	let hasLocation = $derived(latitude !== null && longitude !== null);
</script>

<div class="max-w-2xl mx-auto">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold mb-4">VETO</h1>
		<p class="text-lg text-base-content/70">Create a new session or join an existing one</p>
	</div>

	<div class="grid md:grid-cols-2 gap-6">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Create Session</h2>
				<p class="text-sm text-base-content/70 mb-4">
					Start a new session and invite others to join
				</p>
				{#if !hasLocation}
					<button class="btn btn-primary w-full" onclick={requestLocation}>
						{locationRequested ? 'Requesting Location...' : 'Allow Location Access'}
					</button>
				{:else}
					<form method="POST" action="?/create">
						<input type="hidden" name="latitude" value={latitude ?? ''} />
						<input type="hidden" name="longitude" value={longitude ?? ''} />
						<button class="btn btn-primary w-full">Create New Session</button>
					</form>
				{/if}
			</div>
		</div>

		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Join Session</h2>
				<p class="text-sm text-base-content/70 mb-4">
					Enter a session code to join an existing session
				</p>
				<form method="POST" action="?/join" class="space-y-4">
					<input
						type="text"
						name="code"
						bind:value={joinCode}
						placeholder="Enter session code"
						class="input input-bordered w-full uppercase"
						required
					/>
					<button class="btn btn-secondary w-full" disabled={!joinCode}> Join Session </button>
				</form>
			</div>
		</div>
	</div>
</div>

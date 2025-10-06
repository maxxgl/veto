<script lang="ts">
	import { resolve } from '$app/paths';
	import RestaurantMap from '$lib/RestaurantMap.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let latitude = $state<number | null>(null);
	let longitude = $state<number | null>(null);
	let radius = $state(2);
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
	<div class="text-center mb-8">
		<h1 class="text-3xl font-bold mb-2">Create Session</h1>
		<p class="text-base-content/70">Set your location and search radius</p>
	</div>

	<div class="card bg-base-200">
		<div class="card-body">
			{#if !hasLocation}
				<div class="text-center py-8">
					<p class="mb-4 text-base-content/70">We need your location to find nearby restaurants</p>
					<button class="btn btn-primary" onclick={requestLocation}>
						{locationRequested ? 'Requesting Location...' : 'Allow Location Access'}
					</button>
				</div>
			{:else}
				<div class="mb-4">
					<RestaurantMap
						options={[]}
						userLocation={{ name: 'Your Location', gps_lat: latitude!, gps_lng: longitude! }}
					/>
				</div>

				<form method="POST" class="space-y-4">
					<input type="hidden" name="latitude" value={latitude ?? ''} />
					<input type="hidden" name="longitude" value={longitude ?? ''} />

					<div class="form-control">
						<label class="label" for="radius">
							<span class="label-text">Search Radius (miles)</span>
						</label>
						<input
							type="number"
							id="radius"
							name="radius"
							bind:value={radius}
							min="0.5"
							max="25"
							step="0.5"
							class="input input-bordered w-full"
							required
						/>
						<span class="label-text-alt text-base-content/60">
							Restaurants within {radius}
							{radius === 1 ? 'mile' : 'miles'} will be included
						</span>
					</div>

					<button type="submit" class="btn btn-primary w-full">Create Session</button>
				</form>
			{/if}
			<a href={resolve('/')} class="mt-4 text-center">
				<button class="btn btn-soft btn-error w-full">Cancel</button>
			</a>
		</div>
	</div>
</div>

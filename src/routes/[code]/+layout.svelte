<script lang="ts">
	import { page } from '$app/state';
	import RestaurantMap from '$lib/RestaurantMap.svelte';
	import type { LayoutProps } from './$types';
	import type { Options } from '$lib/../kysely-types';

	let { data, children }: LayoutProps = $props();

	let options = $derived(
		(page.data.options || []).map((opt: Options) => ({
			...opt,
			vetoed: data.vetoedOptionIds?.has(Number(opt.id)) ?? false
		}))
	);

	let copied = $state(false);

	async function copyCode() {
		if (page.params.code) {
			await navigator.clipboard.writeText(page.params.code);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}
</script>

<div class="flex justify-between mb-4">
	<button class="text-left mb-2" onclick={copyCode}>
		<div class="text-xl font-bold">
			{#if page.route.id?.includes('[round]')}
				Round {page.data.round?.round}
			{:else}
				{data.session.name}
			{/if}
		</div>
		<div class="flex items-center">
			<div class="text-sm opacity-70">{page.params.code}</div>
			<span class="btn btn-xs btn-ghost">
				{copied ? 'Copied!' : 'Copy'}
			</span>
		</div>
	</button>

	{#if data.participants.length > 0}
		<div>
			<div class="avatar-group -space-x-4 rtl:space-x-reverse">
				{#each data.participants as participant (participant.id)}
					<div class="avatar avatar-placeholder overflow-visible" title={participant.username}>
						<div
							class="bg-neutral text-neutral-content w-10 rounded-full overflow-visible {participant.id ===
							data.user?.id
								? 'ring ring-primary ring-offset-base-100 ring-offset-2'
								: ''}"
						>
							<span class="text-sm">{participant.username[0].toUpperCase()}</span>
							{#if participant.isOwner}
								<div class="absolute -top-1 -left-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4 text-warning"
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
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if options.length > 0}
	<div class="mb-6">
		<RestaurantMap
			{options}
			userLocation={{
				name: 'Your Location',
				gps_lat: data.session.gps_lat,
				gps_lng: data.session.gps_lng
			}}
			radiusMeters={data.session.radiusMeters}
		/>
	</div>
{/if}

{@render children()}

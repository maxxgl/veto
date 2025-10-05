<script lang="ts">
	import { onMount } from 'svelte';
	import type L from 'leaflet';
	import type { Restaurant } from './getRestaurantsFromLocation';

	let { options = [] }: { options: Restaurant[] } = $props();

	let mapContainer: HTMLDivElement;
	let map: L.Map | null = null;
	let markers: L.Marker[] = [];
	let L_module: typeof L | null = null;

	onMount(() => {
		(async () => {
			L_module = (await import('leaflet')).default;

			const validOptions = options.filter((opt) => opt.gps_lat && opt.gps_lng);

			if (validOptions.length === 0) return;

			const centerLat =
				validOptions.reduce((sum, opt) => sum + opt.gps_lat!, 0) / validOptions.length;
			const centerLng =
				validOptions.reduce((sum, opt) => sum + opt.gps_lng!, 0) / validOptions.length;

			map = L_module.map(mapContainer).setView([centerLat, centerLng], 14);

			L_module.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors'
			}).addTo(map);

			if (validOptions.length > 1) {
				const bounds = L_module.latLngBounds(
					validOptions.map((opt) => [opt.gps_lat!, opt.gps_lng!])
				);
				map.fitBounds(bounds, { padding: [50, 50] });
			}
		})();

		return () => {
			map?.remove();
		};
	});

	$effect(() => {
		if (!map || !L_module) return;

		markers.forEach((marker) => marker.remove());
		markers = [];

		const restaurantIcon = L_module.icon({
			iconUrl:
				'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		const greyIcon = L_module.icon({
			iconUrl:
				'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		});

		const validOptions = options.filter((opt) => opt.gps_lat && opt.gps_lng);

		validOptions.forEach((option) => {
			const marker = L_module!
				.marker([option.gps_lat!, option.gps_lng!], {
					icon: option.vetoed ? greyIcon : restaurantIcon,
					opacity: option.vetoed ? 0.5 : 1
				})
				.addTo(map!);

			let popupContent = `<strong>${option.name}</strong>`;
			if (option.cuisine) popupContent += `<br/>Cuisine: ${option.cuisine}`;
			if (option.website)
				popupContent += `<br/><a href="${option.website}" target="_blank" class="text-blue-600 hover:underline">Website</a>`;

			marker.bindPopup(popupContent);
			markers.push(marker);
		});
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
</svelte:head>

<div bind:this={mapContainer} class="h-64 w-full rounded-lg shadow-lg"></div>

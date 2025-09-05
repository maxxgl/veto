<script lang="ts">
	import type { PageProps } from './$types';

	let { data, params }: PageProps = $props();
</script>

<div class="mb-8">{params.code}</div>

<form class="mb-8 mx-auto" method="POST">
	<button class="btn btn-neutral mt-4">add a user</button>
</form>

{#each data.data as x (x.id)}
	<div>
		{x.gps_lat} - {x.gps_lng} - {x.uuid_code}
	</div>
{/each}

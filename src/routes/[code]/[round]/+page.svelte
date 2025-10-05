<script lang="ts">
	import type { PageProps } from './$types';

	let { data, params, form }: PageProps = $props();
	console.log(data, form);
</script>

<div class="mb-8">{params.code}</div>

<form class="mb-8 mx-auto" method="POST" action="?/addUser">
	<button class="btn btn-neutral mt-4">add a user</button>
</form>

{#each data.options as x (x.id)}
	<div class="py-4 flex justify-between items-center gap-8">
		<div class="flex-1">
			<div class="flex">
				<span class="font-bold">{x.name}</span>: {x.description}
				<span class="ml-auto uppercase">{x.genre}</span>
			</div>
			<div class="flex">
				{x.description} <span class="ml-auto">{x.gps_lat}, {x.gps_lng}</span>
			</div>
		</div>
		<form method="POST">
			<input type="hidden" name="option_id" value={x.id} />
			<button class="btn btn-error btn-outline">Eliminate</button>
		</form>
	</div>
{/each}

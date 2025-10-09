<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="container mx-auto max-w-md p-8">
	<h1 class="mb-6 text-3xl font-bold">Enter a Username</h1>
	<form method="POST" class="space-y-4" use:enhance>
		<div class="form-control">
			<label for="username" class="label">
				<span class="label-text">Name</span>
			</label>
			<input
				id="username"
				name="username"
				type="text"
				required
				class="input input-bordered w-full"
			/>
		</div>
		{#if form?.error}
			<div class="alert alert-error">
				<span>{form.error}</span>
			</div>
		{/if}
		<button type="submit" class="btn btn-primary w-full">Continue</button>
	</form>
</div>

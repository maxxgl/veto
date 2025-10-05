<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="container mx-auto max-w-md p-8">
	<h1 class="mb-6 text-3xl font-bold">Sign up</h1>
	<form method="POST" class="space-y-4">
		<div class="form-control">
			<label for="username" class="label">
				<span class="label-text">Username</span>
			</label>
			<input
				id="username"
				name="username"
				type="text"
				required
				class="input input-bordered w-full"
			/>
		</div>
		<div class="form-control">
			<label for="password" class="label">
				<span class="label-text">Password</span>
			</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				class="input input-bordered w-full"
			/>
		</div>
		{#if form?.error}
			<div class="alert alert-error">
				<span>{form.error}</span>
			</div>
		{/if}
		<button type="submit" class="btn btn-primary w-full">Sign up</button>
	</form>
	<p class="mt-4 text-center">
		Already have an account? <a href="/login" class="link" data-sveltekit-preload-data>Login</a>
	</p>
</div>

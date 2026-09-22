<script setup>
defineProps({
	loading: Boolean,
	error: String
});
</script>

<template>
	<section class="status-view" aria-live="polite">
		<p v-if="loading" class="status">Loading data…</p>
		<p v-else-if="error" class="error">{{ error }}</p>
	</section>
</template>

<style scoped>
.status-view {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.status, .error {
	max-width: 480px;
	margin: 0;
	padding: 14px;
	background: #111f21;
	line-height: 1.4;
}

.error {
	color: #ff9b9b;
	border-left: 3px solid #d86161;
}
</style>

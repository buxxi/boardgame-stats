<script setup>
defineProps({
	title: {type: String, required: true},
	open: Boolean,
	items: {type: Array, default: () => []},
	selected: {type: Set, required: true}
});

const emit = defineEmits(["set-all", "toggle"]);
</script>

<template>
	<details class="filter-group" :open="open">
		<summary>{{ title }}</summary>
		<div class="selection-actions">
			<button type="button" @click="emit('set-all', true)">Select all</button>
			<button type="button" @click="emit('set-all', false)">Deselect all</button>
		</div>
		<label v-for="item in items" :key="item" class="check-row">
			<input
				type="checkbox"
				:checked="selected.has(item)"
				@change="emit('toggle', item, $event.target.checked)"
			>
			<slot name="color" :item="item"></slot>
			<span>{{ item }}</span>
		</label>
	</details>
</template>

<style scoped>
.filter-group {
	margin: 22px 0;
}

summary {
	cursor: pointer;
	margin-bottom: 9px;
	color: #fff;
	font-weight: bold;
	font-size: 13px;
}

.selection-actions {
	display: flex;
	gap: 6px;
	margin: 8px 0 12px;
}

button {
	padding: 4px 6px;
	border: 1px solid #34494c;
	border-radius: 3px;
	background: #111f21;
	color: #dbe4e4;
	font-size: 11px;
	cursor: pointer;
}

label {
	display: block;
	margin: 0 0 14px;
	color: #a5aeae;
	font-size: 12px;
}

.check-row {
	display: flex;
	gap: 8px;
	align-items: center;
	margin: 8px 0;
	color: #dbe4e4;
}

.check-row input {
	accent-color: #69b342;
}
</style>

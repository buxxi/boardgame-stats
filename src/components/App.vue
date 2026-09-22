<script setup>
import {onMounted, ref} from "vue";
import AppStatus from "./AppStatus.vue";
import ChartView from "./ChartView.vue";
import FilterSidebar from "./FilterSidebar.vue";
import {DataLoader, Filter} from "../data.js";

const sheetUrl = import.meta.env.VITE_BOARDGAME_SHEET_URL;
const plays = ref([]);
const error = ref("");
const loading = ref(true);
const filters = ref(new Filter());
const dataLoader = DataLoader.fromEnvironment(import.meta.env);

onMounted(async () => {
	if (!sheetUrl) {
		error.value = "Missing VITE_BOARDGAME_SHEET_URL. Configure the spreadsheet URL before building or running the app.";
		loading.value = false;
		return;
	}
	try {
		plays.value = await dataLoader.loadPlays(sheetUrl);
	} catch (cause) {
		error.value = cause instanceof Error ? cause.message : "Could not load spreadsheet data";
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<main class="app">
		<FilterSidebar
			v-if="!loading && !error"
			:plays="plays"
			@update-filter="filters = $event"
		/>
		<section class="content">
			<AppStatus v-if="loading || error" :loading="loading" :error="error"/>
			<ChartView v-else :plays="plays" :filter="filters"/>
		</section>
	</main>
</template>

<style>
:root {
	color-scheme: dark;
	font-family: Ubuntu, Arial, sans-serif;
	background: #020c0e;
	color: #dbe4e4;
}

* {
	box-sizing: border-box;
}

html, body {
	width: 100%;
	height: 100%;
	margin: 0;
}

.app {
	display: flex;
	width: 100%;
	height: 100%;
	background: #020c0e;
}

.content {
	min-width: 0;
	flex: 1;
	padding: 24px;
}
</style>

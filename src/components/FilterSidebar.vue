<script setup>
import {computed, reactive, watch} from "vue";
import {Filter, PLAYER_COLORS} from "../data.js";
import FilterGroup from "./FilterGroup.vue";

const props = defineProps({
	plays: {type: Array, default: () => []}
});

const emit = defineEmits(["update-filter"]);

const filter = reactive(new Filter());

function uniqueValues(plays, selector) {
	return [...new Set(plays.flatMap(selector))].sort((a, b) => a.localeCompare(b));
}

const hosts = computed(() => ["All", ...uniqueValues(props.plays, (play) => [play.host])]);
const games = computed(() => uniqueValues(props.plays, (play) => [play.game]));
const players = computed(() => uniqueValues(props.plays, (play) => play.players.map((player) => player.name)));
const filteredLength = computed(() => filter.filteredPlays(props.plays).length);

const recentPlayers = () => {
	const latestPlayDate = props.plays.reduce((latest, play) => Math.max(latest, play.date.getTime()), 0);
	const cutoff = new Date(latestPlayDate);
	cutoff.setFullYear(cutoff.getFullYear() - 1);
	return new Set(props.plays
		.filter((play) => play.date >= cutoff)
		.flatMap((play) => play.players.map((player) => player.name)));
};

watch(() => props.plays, () => {
	filter.games = new Set(games.value);
	filter.players = recentPlayers();
}, {immediate: true});

watch(filter, () => {
	emit("update-filter", filter);
}, {deep: true, immediate: true});

function setAllGames(selected) {
	filter.games = new Set(selected ? games.value : []);
}

function toggleGame(game, selected) {
	if (selected) {
		filter.games.add(game);
	} else {
		filter.games.delete(game);
	}
}

function setAllPlayers(selected) {
	filter.players = new Set(selected ? players.value : []);
}

function togglePlayer(player, selected) {
	if (selected) {
		filter.players.add(player);
	} else {
		filter.players.delete(player);
	}
}

function playerColor(player) {
	if (!filter.players.has(player)) {
		return null;
	}
	const selectedPlayers = players.value.filter((candidate) => filter.players.has(candidate));
	return PLAYER_COLORS[selectedPlayers.indexOf(player) % PLAYER_COLORS.length];
}
</script>

<template>
	<aside class="sidebar">
		<h1>Boardgame results</h1>
		<label>Host
			<select v-model="filter.host">
				<option v-for="host in hosts" :key="host" :value="host">{{ host }}</option>
			</select>
		</label>
		<label>From date<input v-model="filter.fromDate" type="date" lang="sv-SE"></label>
		<label>To date<input v-model="filter.toDate" type="date" lang="sv-SE"></label>
		<label>Games back to average
			<input v-model.number="filter.windowSize" type="number" min="1" :max="filteredLength" placeholder="Max">
		</label>
		<FilterGroup
			title="Games"
			:items="games"
			:selected="filter.games"
			@set-all="setAllGames"
			@toggle="toggleGame"
		/>
		<FilterGroup
			title="Players"
			:items="players"
			:selected="filter.players"
			open
			@set-all="setAllPlayers"
			@toggle="togglePlayer"
		>
			<template #color="{ item }">
				<i class="player-color" :style="{ backgroundColor: playerColor(item) }"></i>
			</template>
		</FilterGroup>
	</aside>
</template>

<style scoped>
.sidebar {
	position: fixed;
	left: 0;
	top: 0;
	width: 260px;
	height: 100%;
	padding: 18px;
	overflow-y: auto;
	background: #081517;
	border-right: 1px solid #243437;
}

h1 {
	margin: 0 0 24px;
	color: #fff;
	font-size: 20px;
	font-weight: 400;
}

label {
	display: block;
	margin: 0 0 14px;
	color: #a5aeae;
	font-size: 13px;
}

select, input[type="date"], input[type="number"] {
	width: 100%;
	margin-top: 6px;
	padding: 7px;
	border: 1px solid #34494c;
	border-radius: 3px;
	background: #111f21;
	color: #fff;
}

.player-color {
	width: 10px;
	height: 10px;
	flex: 0 0 10px;
	border-radius: 50%;
}

</style>

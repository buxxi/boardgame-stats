<script>
import {formatIsoDate} from "../data.js";

export function renderTooltip({chart, tooltip}, {state, series, plays}) {
	if (tooltip.opacity === 0) {
		state.visible = false;
		return;
	}

	const hoveredDate = tooltip.dataPoints?.[0]?.parsed?.x;
	const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	state.games = hoveredDate === undefined ? [] : plays
		.filter((play) => dayKey(play.date) === dayKey(new Date(hoveredDate)))
		.map((play) => ({
			date: play.date,
			game: play.game,
			host: play.host,
			players: [...play.players].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
		}));
	state.date = state.games[0] ? formatIsoDate(state.games[0].date) : "";
	state.colors = Object.fromEntries(series.map((item) => [item.label, item.color]));
	const container = chart.canvas.parentNode;
	const tooltipElement = container.querySelector(".chart-tooltip");
	const tooltipWidth = tooltipElement?.offsetWidth || 0;
	const rawLeft = chart.canvas.offsetLeft + tooltip.caretX;
	const minLeft = tooltipWidth / 2;
	const maxLeft = container.clientWidth - tooltipWidth / 2;
	state.left = Math.max(minLeft, Math.min(rawLeft, maxLeft));
	state.top = chart.canvas.offsetTop + tooltip.caretY;
	state.visible = true;
}
</script>

<script setup>
import {computed} from "vue";

const props = defineProps({
	state: {type: Object, required: true}
});

const hosts = computed(() => [...new Set(props.state.games.map((game) => game.host))]);

function playerColor(player) {
	return props.state.colors[player.name] || "#dbe4e4";
}

function sortedPlayers(players) {
	return [...players].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}
</script>

<template>
	<div
		class="chart-tooltip"
		:style="{ left: `${state.left}px`, top: `${state.top}px`, opacity: state.visible ? 1 : 0 }"
	>
		<div class="tooltip-title">
			{{ state.date }}{{ hosts.length ? ` @ ${hosts.join(", ")}` : "" }}
		</div>

		<table class="games-table">
			<tbody>
			<tr v-for="game in state.games" :key="`${game.host}-${game.game}`">
				<th scope="row" class="game-name">{{ game.game }}</th>
				<td class="player-entry"
					v-for="(player) in sortedPlayers(game.players)"
					:key="player.name"

				><b>#{{ player.position }}:</b> <span :style="{ color: playerColor(player) }">{{ player.name }}</span>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.chart-tooltip {
	position: absolute;
	padding: 8px 10px;
	border: 1px solid #34494c;
	border-radius: 3px;
	background: #111f21;
	color: #dbe4e4;
	font-size: 12px;
	line-height: 1.5;
	pointer-events: none;
	transform: translate(-50%, -100%);
	transition: opacity 0.1s ease;
	white-space: nowrap;
}

.tooltip-title {
	margin-bottom: 6px;
	color: #fff;
	font-size: 1.5em;
	font-weight: bold;
}

.games-table {
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
}

.games-table th,
.games-table td {
	padding-right: 6px;
	border: none;
	vertical-align: top;
	text-align: left;
}

.game-name {
	color: #dbe4e4;
	font-weight: 600;
}
</style>

<script setup>
import {computed, createApp, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {Chart, Filler, LinearScale, LineController, LineElement, PointElement, TimeScale, Tooltip} from "chart.js";
import "chartjs-adapter-date-fns";
import {formatIsoDate} from "../data.js";
import ChartTooltip, {renderTooltip} from "./ChartTooltip.vue";

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler);

const hoverLinePlugin = {
	id: "hoverLine",
	afterDraw(currentChart) {
		const activeElements = currentChart.tooltip?.getActiveElements();
		if (!activeElements?.length) return;

		const x = activeElements[0].element.x;
		const {top, bottom} = currentChart.chartArea;
		const context = currentChart.ctx;
		context.save();
		context.beginPath();
		context.moveTo(x, top);
		context.lineTo(x, bottom);
		context.lineWidth = 2;
		context.strokeStyle = "#34494c";
		context.stroke();
		context.restore();
	}
};

const props = defineProps({
	plays: {type: Array, required: true},
	filter: {type: Object, required: true},
	playerColors: {type: Object, required: true}
});

function chartSeries(plays, activePlayers, windowSize) {
	const size = Math.max(1, Number.isFinite(windowSize) ? windowSize : plays.length);
	const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
	return activePlayers.map((player) => ({
		label: player,
		data: plays.flatMap((play, index) => {
			const result = play.players.find((entry) => entry.name === player);
			if (!result) return [];
			const rankingValues = plays
				.slice(Math.max(0, index - size + 1), index + 1)
				.flatMap((priorPlay) => {
					const prior = priorPlay.players.find((entry) => entry.name === player);
					return prior ? [prior.ranking(priorPlay.playerCount)] : [];
				});
			const value = rankingValues.reduce((sum, ranking) => sum + ranking, 0) / rankingValues.length;
			const gamesPlayed = plays
				.filter((candidate) => dayKey(candidate.date) === dayKey(play.date))
				.map((candidate) => ({
					date: candidate.date,
					game: candidate.game,
					host: candidate.host,
					players: [...candidate.players].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
				}));
			return [{x: play.date, y: value, play, position: result.position, gamesPlayed}];
		})
	}));
}

const series = computed(() => chartSeries(
	props.filter.filteredPlays(props.plays),
	[...props.filter.players],
	props.filter.windowSize
).map((item) => ({...item, color: props.playerColors[item.label]})));
const filtered = computed(() => props.filter.filteredPlays(props.plays));
const canvas = ref(null);
let chart;
let tooltipApp;
const tooltipState = reactive({visible: false, left: 0, top: 0, date: "", games: []});

function render() {
	if (chart) chart.destroy();
	chart = new Chart(canvas.value, {
		type: "line",
		data: {
			datasets: series.value.map((series) => ({
				label: series.label,
				data: series.data,
				borderColor: series.color,
				backgroundColor: series.color,
				pointRadius: 3,
				pointHoverRadius: 5,
				borderWidth: 2,
				tension: 0,
				spanGaps: true
			}))
		},
		options: {
			maintainAspectRatio: false,
			interaction: {mode: "nearest", intersect: false},
			scales: {
				x: {
					type: "time",
					time: {unit: "day", tooltipFormat: "yyyy-MM-dd"},
					grid: {display: false},
					ticks: {color: "#a5aeae", callback: (value) => formatIsoDate(new Date(value))}
				},
				y: {
					min: -1,
					max: 1,
					grid: {display: false},
					ticks: {
						color: "#a5aeae",
						stepSize: 1,
						callback: (value) => value === 1 ? "Winner" : value === 0 ? "Average" : value === -1 ? "Last place" : ""
					}
				}
			},
			plugins: {
				hoverLine: {},
				legend: {labels: {color: "#dbe4e4"}},
				tooltip: {
					enabled: false,
					external: (context) => {
						mountTooltip(context.chart);
						renderTooltip(context, {
							state: tooltipState,
							plays: filtered.value,
							playerColors: props.playerColors
						});
					}
				}
			}
		},
		plugins: [hoverLinePlugin]
	});
}

function mountTooltip(currentChart) {
	if (!tooltipApp) {
		const element = document.createElement("div");
		currentChart.canvas.parentNode.appendChild(element);
		tooltipApp = createApp(ChartTooltip, {state: tooltipState, playerColors: props.playerColors});
		tooltipApp.mount(element);
	}
}

onMounted(render);
watch(series, render, {deep: true});
onBeforeUnmount(() => {
	chart?.destroy();
	tooltipApp?.unmount();
});
</script>

<template>
	<div class="chart-wrap">
		<canvas ref="canvas"></canvas>
	</div>
</template>

<style scoped>
.chart-wrap {
	position: fixed;
	left: 270px;
	top: 0;
	right: 0;
	bottom: 0;
}
</style>

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({command}) => {
    if (command === "build") {
        const requiredVariables = [
            "VITE_BOARDGAME_SHEET_URL",
            "VITE_BOARDGAME_DATE_COLUMN",
            "VITE_BOARDGAME_GAME_COLUMN",
            "VITE_BOARDGAME_HOST_COLUMN",
            "VITE_BOARDGAME_PLAYER_COUNT_COLUMN"
        ];
        const missing = requiredVariables.filter((name) => !process.env[name]);
        if (missing.length) {
            throw new Error(`Missing build variables: ${missing.join(", ")}`);
        }
    }
    return {base: "./", plugins: [vue()]};
});

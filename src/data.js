import Papa from "papaparse";

export const PLAYER_COLORS = [
    "#69b342", "#e88d35", "#4da6d8", "#d86161",
    "#b07bd8", "#d5c34d", "#55c7ae", "#e783b7",
    "#654923", "#c93d67", "#4f9114", "#f2b02e",
    "#6688cc", "#d8aad3", "#a84a84", "#205d9a"
];

export class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position;
    }

    ranking(total) {
        return total <= 1 ? 1 : 1 - (2 * (this.position - 1)) / (total - 1);
    }
}

export class Play {
    constructor(date, game, host, playerCount, players) {
        this.date = date;
        this.game = game;
        this.host = host;
        this.playerCount = playerCount;
        this.players = players;
    }
}

export class Filter {
    constructor() {
        this.host = "All";
        this.games = new Set();
        this.fromDate = "";
        this.toDate = "";
        this.windowSize = null;
        this.players = new Set();
    }

    matchesPlay(play) {
        const from = this.fromDate ? Date.parse(this.fromDate) : -Infinity;
        const to = this.toDate ? Date.parse(this.toDate) + 24 * 60 * 60 * 1000 : Infinity;
        return (this.host === "All" || play.host === this.host) &&
            this.games.has(play.game) &&
            play.date.getTime() >= from &&
            play.date.getTime() <= to;
    }

    filteredPlays(plays) {
        return plays.filter((play) => this.matchesPlay(play));
    }
}

export function formatIsoDate(date) {
    return date.toISOString().slice(0, 10);
}

export class DataLoader {
    constructor(columns) {
        this.columns = {
            ...columns,
            excluded: new Set([
                ...(columns.excluded || []),
                columns.date,
                columns.game,
                columns.host,
                columns.playerCount
            ])
        };
    }

    static fromEnvironment(environment) {
        const column = (name) => {
            const value = environment[name]?.trim();
            if (!value) throw new Error(`Missing ${name}. Configure the spreadsheet column mapping before building or running the app.`);
            return value;
        };
        const excluded = (environment.VITE_BOARDGAME_EXCLUDED_COLUMNS || "")
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);

        const columns = {
            date: column("VITE_BOARDGAME_DATE_COLUMN"),
            game: column("VITE_BOARDGAME_GAME_COLUMN"),
            host: column("VITE_BOARDGAME_HOST_COLUMN"),
            playerCount: column("VITE_BOARDGAME_PLAYER_COUNT_COLUMN")
        };
        return new DataLoader({
            ...columns,
            excluded
        });
    }

    parseCsv(text) {
        const result = Papa.parse(text, {
            skipEmptyLines: true,
            transform: (value) => value.trim(),
        });

        if (result.errors.length) {
            throw new Error(`Could not parse CSV: ${result.errors[0].message}`);
        }

        return result.data;
    }

    parseDate(value) {
        const date = new Date(Date.parse(value));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    parsePlayers(row) {
        return Object.entries(row)
            .filter(([name, position]) => !this.columns.excluded.has(name) && position !== "")
            .map(([name, position]) => new Player(name.trim(), Number.parseInt(position, 10)))
            .filter((player) => Number.isFinite(player.position));
    }

    parsePlay(headers, cells) {
        const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
        const game = (row[this.columns.game] || "").trim();
        const host = (row[this.columns.host] || "").trim();
        if (!game || !host) return null;
        const date = this.parseDate(row[this.columns.date]);
        if (!date) return null;

        return new Play(
            date,
            game,
            host,
            Number.parseInt(row[this.columns.playerCount], 10),
            this.parsePlayers(row)
        );
    }

    parsePlays(csv) {
        const rows = this.parseCsv(csv);
        if (!rows.length) return [];
        const headers = rows.shift().map((header) => header.replaceAll('"', "").trim());
        return rows.flatMap((cells) => {
            const play = this.parsePlay(headers, cells);
            return play ? [play] : [];
        });
    }

    async loadPlays(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load spreadsheet (${response.status} ${response.statusText})`);
        return this.parsePlays(await response.text());
    }
}

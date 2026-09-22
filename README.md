# Boardgame Stats

A Vue dashboard for exploring board-game results loaded from a CSV-exportable spreadsheet. It provides filters for host, date range, games, and players, then visualizes player rankings over time.

This project is mostly an AI modernization port of my previous handwritten project.

## Run

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
VITE_BOARDGAME_SHEET_URL="https://example.com/results.csv" \
VITE_BOARDGAME_DATE_COLUMN="Date" \
VITE_BOARDGAME_GAME_COLUMN="Game" \
VITE_BOARDGAME_HOST_COLUMN="Host" \
VITE_BOARDGAME_PLAYER_COUNT_COLUMN="Players" \
npm run dev
```

Build for production:

```bash
VITE_BOARDGAME_SHEET_URL="https://example.com/results.csv" \
VITE_BOARDGAME_DATE_COLUMN="Date" \
VITE_BOARDGAME_GAME_COLUMN="Game" \
VITE_BOARDGAME_HOST_COLUMN="Host" \
VITE_BOARDGAME_PLAYER_COUNT_COLUMN="Players" \
npm run build
```

Set `VITE_BOARDGAME_EXCLUDED_COLUMNS` to a comma-separated list for additional columns that should not be interpreted as player names. The date, game, host, and player-count columns are excluded automatically.

## CSV format

For example, a CSV with three players and two plays can look like this:

```csv
Date,Game,Host,Players,Alice,Bob,Carol,Comment
2026-01-10,Codenames,Alex,2,1,1,2,Team game so only two players counted
2026-01-11,Catan,Sam,3,2,1,3
```

Player columns contain finishing positions. Set the column environment variables to match the header names in the CSV.

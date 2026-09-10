Gold Advisor V7 — data-safe GitHub Pages build

# Gold Advisor v6

Static web dashboard for GitHub Pages.

## What changed
- Wider desktop layout and less “AI-looking” visual language.
- Banking / finance app style: clean cards, calm blue palette, compact typography.
- Interactive SVG charts with point-by-point tooltips showing date, sell price, buyback and point-to-point change.
- Dashboard converts the signal into a concrete starting allocation.
- Market page includes contextual reading below the chart.
- Separate Decision and Simulator pages.
- Sparse historical data is treated honestly; calendar-period comparisons are only used when the data supports them.

## Deploy
Upload the contents of this folder to the root of the `main` branch of your GitHub Pages repository.

## Important
The bundled dataset is a historical snapshot set, not a full daily feed. Keep the daily collector / workflow separately maintained and replace `data/prices.json` with verified daily data as it accumulates.

# Gold Advisor v8

Static GitHub Pages dashboard. V8 is designed to be resilient: the app contains an embedded fallback dataset, and will use `data/prices.json` when available. It separates dashboard, market, decision, simulator, and method views.

## Current data note
The dataset is still a historical snapshot series, not a full daily year. The UI therefore avoids pretending that sparse snapshots are daily observations. Add verified daily observations over time to improve confidence.

## Deployment
Upload the contents of this directory to the root of the `main` branch. Enable GitHub Pages from `main` / root.

## Automation
`/.github/workflows/update.yml` currently validates the dataset on a daily schedule. It does not invent prices. Replace/extend it with a verified collector before allowing automated writes to `data/prices.json`.

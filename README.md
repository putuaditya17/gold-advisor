# Gold Advisor v3

Static GitHub Pages dashboard for gold-buy timing analysis. Inspired by the clean, mobile-first banking UX patterns of blu: clear hierarchy, rounded cards, spacious layout, compact navigation, and friendly microcopy.

## Pages
- Dashboard: decision-first summary
- Market: 1-year chart, stats, recent price changes
- Decision: BUY SCORE breakdown and entry ladder
- Simulator: budget, staged buying, break-even
- Method: methodology, limitations, source notes

## Data update
GitHub Actions runs daily and updates `data/prices.json`. The updater uses a public source configured in `scripts/update_prices.py` and fails closed when a price cannot be parsed confidently.

## GitHub Pages
Deploy from `main` branch, root folder.

## Important
The score is a rule-based decision aid, not a forecast or guarantee. Check the final price and fees in Tring before transacting.

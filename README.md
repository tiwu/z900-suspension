# Z900 Suspension Guide (static client-side)

A small static web app that provides a step-by-step suspension setup guide for the 2025 Kawasaki Z900 SE.

It is a presentation-style site with interactive inputs that let you record baseline and final suspension settings, autofill sag calculators, and save snapshots locally (via localStorage). The app is intentionally client-only — no server is required.

## Files
- `index.html` — slide content and presentation container
- `style.css` — theme and layout styles
- `app.js` — presentation logic, placeholder insertion, sag autofill, persistence and history UI
- images: `ohlins_shock_adjust.png`, `sag_measurement.png`, `z900_fork_adjust.png`

## Usage
Open `index.html` in any modern browser. The app stores saved snapshots in `localStorage` under the `z900-suspension-history` key.

Tips:
- Fill the baseline (slide 4) and final (slide 10) values and navigate away to store a combined snapshot.
- Use the Saved Records slide to restore or delete snapshots.
- The Reset control clears inputs without creating noisy empty history entries.

## Development
No build step is required. Edit files and reload the page in your browser.

## Publishing
This repository includes a GitHub Actions workflow to publish the site to GitHub Pages. Push to the `main` branch and the workflow will deploy the repository root to GitHub Pages.

## Contributing
Small fixes and UI improvements welcome. Please open a PR with changes.

## License
Add your preferred license (e.g. MIT) to the repository.

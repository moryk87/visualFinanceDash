# SubGrid

A static finance dashboard for visualizing income, expenses, savings, investments, and monthly free cashflow.

## What it does

- Track income, expenses, savings, and investments
- View costs as a proportional treemap and beeswarm chart
- Import recurring payments from bank statements (CSV)
- Export your visualization as an image
- Supports 38+ currencies

## Deploy to GitHub Pages

This repository includes a GitHub Actions workflow for GitHub Pages:

1. Push the repository to GitHub.
2. In GitHub, open **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch, or run **Deploy to GitHub Pages** manually from the **Actions** tab.

The workflow publishes only the static app files: `index.html`, `styles.css`, `js/`, `LICENSE`, and `.nojekyll`.

## How to use

Serve the files with any static server:

```
npx serve .
```

or

```
python -m http.server
```

Your data stays in your browser's local storage.

## Stack

Plain HTML, CSS, and JavaScript. Uses Tailwind CSS for styling.

## License

MIT

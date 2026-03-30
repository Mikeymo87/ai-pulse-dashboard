# AI Pulse Dashboard

A React-based data visualization dashboard built with Vite, Tailwind CSS, Recharts, and PapaParse. It visualizes survey data from CSV files.

## Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4
- **Charts:** Recharts
- **CSV Parsing:** PapaParse
- **Animations:** Framer Motion
- **Package Manager:** npm

## Project Structure

```
/
├── public/
│   └── data/          # CSV survey data files (survey1.csv, survey2.csv, survey3.csv)
├── src/
│   ├── assets/        # Static images and icons
│   ├── App.jsx        # Main application component
│   ├── App.css        # Component styles
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── index.html         # HTML entry point
├── vite.config.js     # Vite configuration
└── package.json
```

## Development

- **Dev server:** `npm run dev` — runs on port 5000 (0.0.0.0)
- **Build:** `npm run build` — outputs to `dist/`

## Deployment

Configured as a static site deployment:
- Build command: `npm run build`
- Public directory: `dist`

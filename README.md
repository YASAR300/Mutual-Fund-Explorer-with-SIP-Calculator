Mutual Fund Explorer + SIP Calculator (Next.js + MUI)
====================================================

Overview
--------

This app wraps the public MFAPI.in endpoints and provides a fast, responsive UI to explore mutual funds, view NAV charts, and calculate SIP returns.

Tech stack:

- Next.js (App Router)
- Material UI (MUI) + MUI X Charts
- SWR for data fetching
- dayjs for date handling

Getting Started
---------------

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

API Routes (Wrappers)
---------------------

- `GET /api/mf`: list all schemes (cached 12h)
- `GET /api/scheme/:code`: scheme metadata + normalized NAV history
- `GET /api/scheme/:code/returns?period=1m|3m|6m|1y` or `from&to`: returns summary
- `POST /api/scheme/:code/sip`: SIP calculation

SIP Request body example:

```json
{
  "amount": 5000,
  "frequency": "monthly",
  "from": "2020-01-01",
  "to": "2023-12-31"
}
```

UI Pages
--------

- `/` – Landing page
- `/funds` – Fund search/listing, grouped by fund house
- `/scheme/[code]` – Scheme metadata, NAV chart (1y), returns table, SIP calculator with growth chart

Performance & Caching
---------------------

- In-memory cache with TTL (12h) for `/mf` and per-scheme NAVs (`src/lib/cache.js`).
- Client-side SWR to avoid redundant calls.

Notes
-----

- Data courtesy of MFAPI.in (`https://www.mfapi.in/`).
- This app is for educational purposes; verify results before financial decisions.

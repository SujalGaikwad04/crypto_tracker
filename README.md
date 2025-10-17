# Crypto Tracker

A React single-page app to track cryptocurrency markets with live data, charts, authentication, and a personal watchlist. Includes an Admin panel for simple maintenance actions.

## Features

- Market overview table with search, pagination, and sorting by market cap
- Currency toggle (USD/INR) with symbol handling
- Coin detail pages with interactive historical price charts (1D to max)
- Authentication (Email/Password and Google) via Firebase
- Per-user watchlist stored in Firestore (add/remove from detail page, manage in sidebar)
- Global alerts system for success/error toasts
- Responsive, dark-themed UI using Material UI
- Admin page (/admin) with restricted access by email

## Tech Stack

- React 17 (Create React App)
- Material UI v4
- React Router v5
- Axios
- Chart.js 3 + react-chartjs-2
- Firebase v9 (Auth + Firestore)
- CoinGecko Public API

## API Endpoints Used

- Markets: `GET https://api.coingecko.com/api/v3/coins/markets?vs_currency=<CURRENCY>&order=market_cap_desc&per_page=100&page=1&sparkline=false`
- Single coin: `GET https://api.coingecko.com/api/v3/coins/<ID>`
- Historical chart: `GET https://api.coingecko.com/api/v3/coins/<ID>/market_chart?vs_currency=<CURRENCY>&days=<DAYS>`

See implementation in `src/config/api.js`.

## Project Structure (high-level)

- `src/App.js` — routes and app shell
- `src/CryptoContext.js` — global app state (currency, user, coins, watchlist, alerts)
- `src/components/*` — UI components (table, charts, auth modal, sidebar, banner)
- `src/Pages/HomePage.js` — landing page with banner + market table
- `src/Pages/CoinPage.js` — coin detail + chart + watchlist CTA
- `src/Pages/AdminPage.js` — admin tools (restricted)
- `src/config/api.js` — CoinGecko endpoints
- `src/config/firebaseConfig.js` — Firebase config (replace with your credentials)
- `src/config/admins.js` — list of admin emails
- `src/firebase.js` — Firebase initialization (Auth + Firestore)

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- Firebase project with Authentication and Cloud Firestore enabled

### Installation
1. Install dependencies:
   ```
   npm install
   ```
2. Configure Firebase: update `src/config/firebaseConfig.js` with your project credentials. Enable Auth providers you need (Email/Password, Google) and create a Cloud Firestore database in production or test mode as appropriate.
3. Set admin access: edit `src/config/admins.js` and add the email(s) that should access the Admin page.

### Run
```
npm start
```
App runs on http://localhost:3000.

### Build
```
npm run build
```

### Test
```
npm test
```

## Admin Page
- Path: `/admin`
- Access: gated by emails listed in `src/config/admins.js`
- Tools included:
  - Broadcast a test alert
  - Clear your own watchlist
  - Clear any user’s watchlist by UID

## Notes
- Coin data and charts come from CoinGecko; rate limits may apply.
- Watchlists are per user and stored in the Firestore document: collection `watchlist`, doc id = `uid`, field `coins: string[]`.
- If the Admin button doesn’t appear in the header, confirm you are logged in and your email is in `ADMINS`.

## License
This project is provided for learning and personal use.

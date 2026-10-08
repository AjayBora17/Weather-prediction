# Atmos — Weather Prediction UI

A responsive, accessible weather page for AjayBora17/Weather-prediction. No external frontend dependencies, no CDN fonts, and no package installation required for local use. Uses a Vercel Node function to keep your OpenWeather key server-side.

## Deploy on Vercel

1. Copy this folder's contents into your GitHub repository root (replace the previous `vercel.json`). Commit all files, including `public`, `api`, `scripts`, and `package.json`.
2. Import that GitHub repository in Vercel. Set **Framework Preset: Other**, **Root Directory: repository root**, **Build Command: npm run build**, **Output Directory: public**, **Node.js: 24.x**. The included configuration supplies the build/output settings.
3. In Vercel environment variables, add **OPENWEATHER_API_KEY** with your OpenWeather key. Enable it for Production and Preview as needed. Never prefix it with a browser-public prefix.
4. Deploy. If you add or change the variable after deploying, redeploy.
5. Search `Delhi, IN`. Check current conditions, forecast, Fahrenheit toggle, and an invalid city. Geolocation requires HTTPS and browser permission.

The original notebook contained a hardcoded key. Rotate it in OpenWeather, remove it from repository history as appropriate, and use a new environment variable. This package removes that key and notebook outputs.

## Run locally

Requires Node.js 24.

```sh
cp .env.example .env.local
# Edit .env.local and add your new key.
npm run dev
```

Open http://localhost:3000. The sample forecast is explicitly labelled and works without a key. Live requests need a working key and internet access.

```sh
npm test
npm run build
```

## Included

- City/country search and opt-in browser location lookup.
- Celsius/Fahrenheit display, local observation time, sunrise/sunset.
- Humidity, wind, visibility, air pressure.
- Next eight 3-hour forecast intervals and up to five calendar-date summaries.
- Loading states, readable errors, stale-request cancellation, timeout handling.
- Server-side key, input validation, fixed upstream host, 5-minute shared response caching, and security headers.
- Node built-in tests and a local API/static development server.

The current-temperature min/max from the original notebook are deliberately not presented as daily highs/lows. Daily ranges here summarize only available provider forecast intervals. Times use the provider's location UTC offset (not a timezone database; a daylight-saving transition can affect future labels).

## What this does and does not run

The uploaded project contained a Colab notebook, not a deployed HTTP backend. It references `/content/weather.csv`, but that dataset and trained models were not included. This app serves **OpenWeather current conditions and provider forecasts**; it does not claim these are predictions from your random forests. The original notebook is retained as research code, with the key removed. Its training logic has not been validated or changed.

To integrate your own ML service later, expose a hosted prediction endpoint and connect it through a server-side adapter. Keep training outside request handlers. Supply the trained model, preprocessing artifacts, feature units/order, and a sample JSON response. In the original notebook, a single LabelEncoder is reused for wind and target labels, so preprocessing needs correction before model predictions should be relied on.

## Operations and verification

No real OpenWeather key was used during development; network responses were mocked for automated tests. A real Vercel deployment and authenticated live-provider check remain necessary. There is no guarantee of zero provider outages or deployment/account misconfiguration. For public traffic, configure Vercel Firewall rate limiting and OpenWeather quota alerts appropriate to your plan.

API: `GET /api/weather?city=Delhi,IN` or `GET /api/weather?lat=28.61&lon=77.21`.

Official references: https://vercel.com/docs/functions/runtimes/node-js · https://openweathermap.org/current · https://openweathermap.org/forecast5

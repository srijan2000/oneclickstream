# oneclickstreemUI

Mobile-first React frontend for generating oneclickstreemUI stream configuration data.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
```

Create a `.env` file if you need to override the API base URL:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Run

Start the dev server so your iPhone can reach it over the local network:

```bash
npm run dev -- --host 0.0.0.0
```

Vite will print a local network URL. Open that URL from iPhone Safari using your computer's local IP, for example:

```text
http://192.168.1.20:5173
```

Make sure the frontend can reach the backend at `VITE_API_BASE_URL`.

## Build

```bash
npm run build
```

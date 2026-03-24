# MC Bot — Open Source Minecraft Bot with Dashboard

A Minecraft 1.21.11 bot with a Next.js control dashboard. Made by TerrorAqua.

## Features

- Connects to any Minecraft 1.21.11 server (offline auth)
- Auto-reconnects every 10 minutes
- Sends a welcome/hourly message every 60 minutes
- Runs `/register` and `/login` on spawn (if password is set)
- Next.js dashboard with login protection
- Guest mode: shows nickname, IP, and connection status without a password
- Full mode: live logs, chat sender, force reconnect, settings editor

## First-time setup

All bot settings (server IP, username, in-game password, links) are configured
directly in the dashboard UI after login. No extra env vars needed for that.

## Environment Variables (only 2 required)

| Variable | Description |
|---|---|
| `DASHBOARD_PASSWORD` | Password to log into the dashboard |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |

## Running Locally

```bash
cp .env.example .env
npm install
npm run build
npm start
```

Dashboard: http://localhost:3000

## Deploying to Railway

1. Push the project to GitHub.
2. On [railway.app](https://railway.app), create a **New Project → Deploy from GitHub repo**.
3. Select your repo.
4. Go to the service **Variables** tab and add:
   - `DASHBOARD_PASSWORD` = your dashboard password
   - `NEXT_PUBLIC_API_URL` = `http://localhost:3001`
5. Railway will build and deploy automatically.
6. Open the public URL, log in, and fill in your bot settings in the Setup page.

## License

MIT

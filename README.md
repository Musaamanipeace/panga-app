# Panga - Project & Resource Planner

Personal, offline-first project and resource planner with Gemini AI integration.

## Architecture

- **Frontend**: React 19 SPA with Vite, TypeScript, and offline-first IndexedDB (Dexie).
- **Backend**: Express on Node.js 22 providing secure server-side Gemini AI processing (`/api/assistant/chat`), health monitoring (`/health`), and static SPA hosting.
- **Hosting**: Configured for **Fly.io** using Docker and `fly.toml`.

---

## Deploying Backend to Fly.io

### 1. Install Flyctl
Install the Fly CLI tool if not already installed:
```bash
# macOS
brew install flyctl

# Linux / WSL
curl -L https://fly.io/install.sh | sh

# Windows (Powershell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Login to Fly.io
```bash
fly auth login
```

### 3. Launch App
If setting up for the first time:
```bash
fly launch --copy-config
```
This uses the included `fly.toml` and `Dockerfile`.

### 4. Configure Secrets
Set your server-side API keys securely on Fly.io:
```bash
# Set Gemini API Key
fly secrets set GEMINI_API_KEY="your-gemini-api-key"
```

### 5. Deploy
Deploy the container to Fly.io machines:
```bash
fly deploy
```

Fly.io will:
1. Build the production Docker container (building the Vite frontend and preparing production dependencies).
2. Start the Express server listening on internal port `8080` (mapped to public HTTPS ports 80/443).
3. Validate container health via `/health`.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server locally
npm start
```

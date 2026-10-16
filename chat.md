# Conversation Transcript: BreatheSG Development

**Application**: BreatheSG — Singapore Live PSI & Air Quality Alert Monitor  
**Repository**: [https://github.com/rachelkoh10/haze-watcher](https://github.com/rachelkoh10/haze-watcher)  
**Date**: October 16, 2026 (SGT)  

---

## Turn 1

### User
> build a singapore based application that track live PSI levels and alerts users when air quality drops to unhealthy thresholds, it should include interactive map and push notifications. 
> 
> build just the front end for now. i will add the serverless backend connection later.

### Assistant
Built **BreatheSG**, a production-grade frontend monitoring application designed specifically for Singapore's National Environment Agency (NEA) PSI and $\text{PM}_{2.5}$ tracking standards:

1. **Interactive Singapore Regional Map (`src/components/SingaporeMap.tsx`)**:
   - Calibrated SVG regional geometry representing the 5 official NEA zones: **North**, **South**, **East**, **West**, and **Central**, plus offshore islands (Jurong Island, Sentosa, Pulau Ubin, and Pulau Tekong).
   - Dynamic color-coding according to active metric: **24-Hour PSI** or **1-Hour $\text{PM}_{2.5}$**.
   - Live station telemetry badges with interactive zone focus and click-to-inspect details.
   - Surface wind vector display with real-time speed and bearing indicator (e.g. Southwest monsoon haze breeze).
   - Official NEA PSI & $\text{PM}_{2.5}$ reference legend bars.

2. **Push Notifications & Alert Engine (`src/components/NotificationSettingsModal.tsx`, `src/components/AlertBanner.tsx`, `src/services/audioAlert.ts`)**:
   - Web Notification API integration with browser permission prompts.
   - Configurable trigger thresholds for 24-hr PSI (default: `101 PSI` — *Unhealthy*) and 1-hr $\text{PM}_{2.5}$ (default: `56 µg/m³` — *Elevated*).
   - Region-specific alert subscriptions (North, South, East, West, Central, Singapore Overall).
   - Web Audio API synthesized audible chimes (gentle dual-tone warning and multi-tone critical alert).
   - Sticky active threshold breach banner with dismiss and quick rule management.
   - Persistent alert history log with timestamps and advisories stored in `localStorage`.
   - "Test Push Alert" button for immediate browser notification verification.

3. **Scenario Simulator & Live Data Stream (`src/components/SimulationControls.tsx`, `src/services/airQualityService.ts`)**:
   - Direct integration with Singapore open data API (`api.data.gov.sg`) with resilient fallback.
   - 4 instant test scenarios: *Live NEA Feed*, *Transboundary Haze Alert (148 PSI)*, *Severe Spike (235 PSI)*, and *Clean Day (28 PSI)*.

4. **Official Singapore NEA & MOH Health Advisories (`src/components/HealthAdvisory.tsx`)**:
   - 3-tier demographic health guidelines:
     1. Healthy Individuals
     2. Elderly, Pregnant Women, Children
     3. Persons with Chronic Lung or Heart Disease
   - Activity suggestions, hydration guidelines, and N95 respirator mask recommendations.

5. **24-Hour Historical Progression Chart (`src/components/TrendChart.tsx`)**:
   - Multi-zone SVG curve visualization with threshold reference lines (Good: 50, Unhealthy: 100, Very Unhealthy: 200).
   - Interactive crosshair hover inspection with exact timestamps and readings.

---

## Turn 2

### User
> git push https://[AUTH_TOKEN]@github.com/rachelkoh10/haze-watcher.git

### Assistant
- Initialized local Git repository on branch `main`.
- Configured user credentials and staged all initial project files.
- Committed codebase with message: `"Initial commit: Singapore live PSI and air quality tracker with interactive map and push alerts"`.
- Pushed to remote GitHub repository: `https://github.com/rachelkoh10/haze-watcher.git`.
- Sanitized local git remote URL to remove plain-text access tokens for security.

---

## Turn 3

### User
> add a serverless API connection that pulls live data from data.gov.sg using the following end point:
> 
> GET: https://api-open.data.gov.sg/v2/real-time/api/psi
> 
> - store this in /api folder in the project root level, not the src folder
> - include /health.ts and psi.ts within the same subfolder 
> - there is no key required for this service

### Assistant
Created the root-level `/api` serverless backend and full-stack runtime integration:

1. **`/api/psi.ts`**:
   - Serverless handler pulling live data from `GET https://api-open.data.gov.sg/v2/real-time/api/psi`.
   - Requires no API key.
   - Forwards optional query parameters (`date`, `date_time`).
   - Implements CORS headers and HTTP cache headers (`Cache-Control: public, max-age=60, s-maxage=120, stale-while-revalidate=300`).
   - Returns structured regional metadata and latest pollutant readings.

2. **`/api/health.ts`**:
   - Service health check endpoint returning status (`ok`), uptime, service identifier, and ISO timestamp.

3. **`server.ts` & Runtime Configuration**:
   - Configured Express server running on port 3000 that routes `/api/psi` and `/api/health`.
   - Mounts Vite middleware during development for seamless SPA routing.
   - Updated `package.json` scripts:
     - `"dev": "tsx server.ts"`
     - `"start": "tsx server.ts"`

4. **Verification & Endpoint Testing**:
   - `GET /api/health` verified with HTTP 200 (`{"status":"ok","service":"breathe-sg-api", ...}`).
   - `GET /api/psi` verified with HTTP 200 (live real-time Singapore PSI payload returned).
   - Updated `src/services/airQualityService.ts` to query `/api/psi` as primary data source.
   - Staged, committed, and pushed updates to `main` branch on GitHub: `https://github.com/rachelkoh10/haze-watcher`.

---

## Turn 4

### User
> export this entire chat as chat as .md file

### Assistant
Exported the full conversation history to `chat.md` in the project root directory.

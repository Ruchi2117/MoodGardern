# MoodGarden 🌷

[Open the live app](https://moodgarden-ruchi2117.onrender.com) — hosted on Render Free with MongoDB Atlas Free. The service sleeps when inactive, so the first visit may take about a minute. AI chat remains disconnected; the local companion works without a provider.

**MERN assessment submission · React + Node.js + Express + MongoDB · Kiro CLI used**

[Live Demo](https://moodgarden-ruchi2117.onrender.com) · [Kiro Review Evidence](docs/kiro-review.md) · [Architecture Walkthrough](docs/architecture-talk.md)

## What is MoodGarden?

A cozy mood-tracking and journaling app where your feelings become a little garden. Record a feeling, leave a thought, and take a small moment for yourself. The garden reflects saved check-ins; daily rituals represent gentle acts of care.

## Try it in two minutes

1. Open the live demo and create an account. No installation is required.
2. Save a mood check-in and watch a plant appear in your garden.
3. Open Journal to find or edit the saved entry. Complete a daily ritual and explore Insights.
4. Meet Fern in the pocket garden: rotate the character, customize the companion, and try the local habit chat. Sounds are optional.

## Features

- **Mood check-ins:** seven feelings, an optional thought, activities, and recorded energy.
- **Persistent garden:** MongoDB-backed feelings become plants, with deterministic positions and a calm planting animation. The latest 12 plants stay visible while every saved feeling counts.
- **Journal:** search, mood filtering, sorting, full-entry dialogs, editing, and confirmed deletion.
- **Daily rituals:** three curated daily invitations, saved completion, and rewards awarded once.
- **Gentle insights:** real mood counts, energy averages, local-calendar check-in streaks, timelines, and descriptive observations.
- **Authentication:** registration, login, JWT-protected pages/APIs, session restoration, and logout.
- **Responsive interface:** cream/sage botanical styling, keyboard controls, visible focus, and reduced-motion support.
- **Optional pocket garden:** an interactive 3D sprout, tactile retro handheld, and mood-backed miniature diorama. Tap to wave, make pretend rain or rotate; saved moods and completed rituals trigger a short celebration. The original garden stays intact.
- **Woodland companion:** original illustrated mood faces, a customizable friend, optional soft sounds, and free local habit chat. Optional AI routing is implemented but remains disconnected until a provider is chosen. [Details and privacy](docs/companion.md).

## Screenshots

### A feeling becomes a plant

![A real mood submission growing the garden](docs/showcase/garden-growing.gif)

### Your little sanctuary

![Personal garden](docs/showcase/garden.png)

### Thoughts, care, and a little look back

![Saved thoughts in the journal](docs/showcase/journal.png)

![Completed daily rituals](docs/showcase/rituals.png)

![Insights from saved check-ins](docs/showcase/insights.png)

These five assets show the running app with fictional local demo entries. The GIF records an actual successful API-backed submission, not a mock animation. More mobile screenshots and review evidence are in [docs](docs/).

## Tech Stack

| Area           | Technology                                                                   |
| -------------- | ---------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide icons         |
| Backend        | Node.js, Express 5                                                           |
| Database       | MongoDB, Mongoose                                                            |
| Authentication | JWT via jsonwebtoken, bcryptjs                                               |
| Animation      | Original SVG/CSS garden plus a lazy-loaded, locally modelled Three.js pocket scene |
| Tests          | Node test runner, Supertest, isolated real MongoDB via mongodb-memory-server |

## Architecture

```text
React + TypeScript
        ↓ typed HTTP client
REST API / Express
        ↓ owner-scoped queries and validation
Mongoose models
        ↓
MongoDB
```

**MoodEntry is the shared source of truth for Garden, Journal, and Insights.** Garden and Journal use one client history context; successful edits/deletions update that collection. Insights aggregates the same database records server-side. It does not receive journal notes or perform psychological interpretation. Ritual stores daily task snapshots and awarded care separately, without creating additional mood plants.

AuthContext owns the current user and session state. Registration hashes the password with bcrypt cost 12; login compares the hash. Public responses never contain passwordHash. Seven-day JWTs use HS256, issuer/audience checks, expiry validation, and a MongoDB user ID as the subject. Middleware reads a Bearer token and attaches req.user.id. Every data query derives ownership from this ID, ignoring frontend userId values. Late session requests cannot restore a logged-out account or clear a newer login.

The client keeps its Bearer token in localStorage for refresh persistence. Logout removes that browser session. Browser routes are protected, and the server independently authenticates every protected API request.

## Project Structure

```text
client/src/
  components/        Garden, check-in, Journal, rituals, and insight UI
  context/           Authentication and shared mood history
  hooks/             Async flow, retry, and read-cancellation handling
  pages/             Auth, Garden, Journal, and Insights
  services/api.ts    Typed HTTP requests and configured API base
  *.css              Approved styling and accessibility refinements
server/src/
  config/            Validated environment and MongoDB connection
  controllers/       Request validation and HTTP responses
  middleware/        JWT verification and auth attempt limiting
  models/            User, MoodEntry, Ritual
  routes/            REST endpoint mappings
  services/          Deterministic ritual and insight calculations
server/tests/        API, ownership, date, concurrency, and config tests
shared/              Single mood mapping, curated rituals, growth constants
server/scripts/      Local MongoDB helper and backend syntax checks
docs/                Screenshots and final review evidence
```

## Getting Started

Requirements: **Node.js 22.12+** (tested with Node 24), npm, and a MongoDB connection. PowerShell commands are shown; on macOS/Linux use `cp` instead of `Copy-Item`.

```powershell
git clone https://github.com/Ruchi2117/MoodGardern.git MoodGarden
cd MoodGarden
npm ci
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Set JWT_SECRET in server/.env to a cryptographically random secret of at least 32 characters. Generate one with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the result in your local environment file. Never commit it. Set MONGODB_URI to your local MongoDB or managed MongoDB connection.

## Environment Variables

| Variable      | Location           | Meaning                                                                             |
| ------------- | ------------------ | ----------------------------------------------------------------------------------- |
| MONGODB_URI   | Server             | Required database connection URI                                                    |
| JWT_SECRET    | Server             | Required signing secret, at least 32 characters                                     |
| PORT          | Server             | Listening port; defaults to 5000                                                    |
| NODE_ENV      | Server             | development locally; production on hosting                                          |
| CLIENT_ORIGIN | Server             | Exact frontend origin; required in production, no path/trailing slash               |
| HOST          | Server             | Optional; defaults to 127.0.0.1 locally and 0.0.0.0 in production                   |
| TRUST_PROXY   | Server             | Optional trusted proxy-hop count (1–10); omit for direct access                     |
| SERVE_CLIENT  | Server             | Set true to serve the built React client and browser routes from Express            |
| VITE_API_URL  | Client, build time | Empty uses same-origin /api; split hosting uses a full HTTPS API URL ending in /api |

Only VITE_API_URL is public client configuration. Never place database credentials or JWT secrets in a VITE_ variable. Both .env.example files are tracked; actual .env files are ignored.

## Running Locally

If you already run MongoDB, use that service and skip the helper. Otherwise, in terminal one:

```powershell
npm run db:local -w server
```

This helper downloads a real MongoDB binary on first use and runs it on loopback port 27017. WiredTiger files persist in ignored .local/mongodb. Tests use separate temporary databases. The helper is for development; production requires a separately operated or managed MongoDB.

In terminal two:

```powershell
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The API runs at port 5000; Vite proxies /api during development. You can also run each service separately:

```powershell
npm run dev -w server
npm run dev -w client
```

Environment validation, MongoDB connection, and required indexes complete before the API listens. Restart the API after editing server/.env. Client variables require restarting Vite or rebuilding.

## API Overview

Responses use `{data: ...}` or `{error: {message}}`.

| Method | Endpoint                                               | Purpose                                                      |
| ------ | ------------------------------------------------------ | ------------------------------------------------------------ |
| GET    | /api/health                                            | Service health                                               |
| POST   | /api/auth/register                                     | Create account and issue JWT                                 |
| POST   | /api/auth/login                                        | Authenticate and issue JWT                                   |
| GET    | /api/auth/me                                           | Current database user                                        |
| POST   | /api/moods                                             | Save a check-in; current client sends a clientRequestId UUID |
| GET    | /api/moods                                             | Owner’s mood history                                         |
| GET    | /api/moods/:id                                         | Owner’s individual entry                                     |
| PUT    | /api/moods/:id                                         | Validated entry update                                       |
| DELETE | /api/moods/:id                                         | Delete owner’s entry                                         |
| GET    | /api/rituals/today?timeZone=Asia/Kolkata               | Find/create today’s three rituals                            |
| PUT    | /api/rituals/today/tasks/:taskId?timeZone=Asia/Kolkata | Mark done with `{completed:true}`                            |
| GET    | /api/insights?timeZone=Asia/Kolkata&period=30          | Owner’s computed insights; period is 7, 30, or all           |

All endpoints except health, registration, and login require Bearer authentication. Validation failures return 400, invalid sessions 401, inaccessible/missing records 404, duplicate emails/request-key conflicts 409, oversized bodies 413, and excessive authentication attempts 429. Unexpected errors return a safe 500 message without a stack trace.

### Data guarantees

- **Indexes:** unique normalized User.email; MoodEntry user/date reads and partial unique userId/clientRequestId; unique Ritual userId/date. All initialize before the API accepts requests.
- **Safe retries:** an unchanged mood request with the same user-scoped UUID replays the saved entry. Different content under that UUID returns 409. Concurrent requests insert once. Legacy no-key entries remain supported.
- **Growth:** shared/growth.js defines +10 per mood and +3 per ritual, maximum +9 ritual care per local date. Ritual completion and reward update atomically and cannot be repeatedly awarded. Saved care remains across missed days.
- **Local days:** the browser sends its IANA timezone; the server uses its own clock to derive the local YYYY-MM-DD date. Ritual sets are deterministic for user/date. Insights use inclusive calendar-day periods.
- **Streak:** distinct mood check-in days ending today, or yesterday when today is empty, walking backward until a gap. Multiple check-ins per day count once. Rituals never affect it.
- **Honest insights:** explicit most-common ties, averages excluding missing/invalid energy, bounded 30-day timeline, descriptive observations, and appropriate empty/small-data states.

## Testing

```powershell
npm run check
npm test
npm run build
npm audit --omit=dev
```

**55 API tests plus 5 local-chat tests** cover auth/hash exclusion, invalid and expired JWTs, ownership, validation, CRUD, idempotency, concurrent rituals, one-time growth, insights, timezones, production configuration, static routing, companion input/privacy/rate limits, and local habit follow-ups. GitHub Actions runs checks, tests and the production build on pushes and pull requests.

The test runner uses isolated MongoDB instances and never modifies your application database. First use may download MongoDB. Final browser review covered all six page routes at 320, 375, 390, 430, 768, 1024, 1280, and 1440 pixels; keyboard dialogs/focus/Escape; long notes; empty/single/capped gardens; outage retry states; account isolation; and a simulated expired-session response. See [final review](docs/final-review.md) and [responsive measurements](docs/final-responsive-audit.json).

## Production Deployment

The submission has a **$0 hosting budget**. [Free deployment instructions](docs/free-deployment.md) describe Render Free plus Atlas M0, with no paid resources or payment method. `render.yaml` selects a free single-service Docker deployment. The app is live at [moodgarden-ruchi2117.onrender.com](https://moodgarden-ruchi2117.onrender.com). Render serves the React build and Express API from one HTTPS origin; Atlas stores application records. The deployed Docker build passed, and public API smoke checks verified registration, login, database-backed session lookup, duplicate-email handling and invalid/missing-token rejection. Direct unauthenticated dashboard navigation redirects to login.

For same-origin deployment, Express serves the built client when `SERVE_CLIENT=true`; leave `VITE_API_URL` empty. For other deployment arrangements:

1. Provision a managed MongoDB database with authentication, backups, TLS, and appropriately restricted network access.
2. Run the backend on a Node-capable host. Set NODE_ENV=production, MONGODB_URI, a fresh JWT_SECRET, PORT, and the exact HTTPS CLIENT_ORIGIN. Use HOST=0.0.0.0 when the host requires it. Set TRUST_PROXY only to the known hop count of the reverse proxy that strips untrusted forwarded headers.
3. Install dependencies with `npm ci`, then run `npm start`. The server connects to MongoDB and verifies indexes before listening. SIGTERM/SIGINT close HTTP connections and disconnect MongoDB. Health endpoint: /api/health.
4. Build the frontend with `npm run build`. Serve client/dist from a static host. For split frontend/API hosting, set VITE_API_URL=https://your-api-host/api **before the build**. For same-origin hosting, keep it empty and reverse-proxy /api to Express.
5. Configure SPA fallback: requests for /login, /register, /dashboard, /journal, and /insights must serve index.html when they are not static assets. Preserve /api routing separately.
6. Terminate HTTPS at the hosting edge. Add frontend security headers there (a CSP compatible with this app’s inline style attributes, frame protection, and a referrer policy). The API already sends no-store, nosniff, frame protection, and exact-origin CORS headers. Apply shared edge rate limits when using multiple API instances.
7. Verify registration/login, refresh, logout, a mood save/edit/delete, ritual persistence, Insights, and direct route navigation against the deployed URLs. Monitor sanitized server logs and MongoDB availability.

The auth limiter is process-local: 20 login/registration attempts per IP per 15 minutes, with Retry-After. It reduces repeated bcrypt work; it is not a replacement for a shared gateway limiter at scale.

## AI Development Experience

### Selected assessment tool: Kiro

**Kiro CLI 2.27.1 was used for four genuine final-stage source reviews. Code0 was not used.** Initial implementation and browser verification were assisted by Codex. Kiro's contribution was review and problem finding, rather than generating the initial application. The actual prompts, responses, and decisions are retained in [Kiro review evidence](docs/kiro-review.md).

I used focused review scopes so each response could be checked against the source and tests. I evaluated suggestions before changing code, accepted a missing regression test, and rejected findings that did not match the implementation. This made the tool useful without treating its output as automatically correct.

### Four specific Kiro tasks

| Task | How Kiro was used | Outcome |
| --- | --- | --- |
| Authentication and ownership review | Reviewed JWT verification, password-hash exclusion, and user-scoped API access. | Checked findings against middleware, models, and tests; rejected an incorrect JWT-subject concern. [Transcript](docs/kiro/auth-review.txt) |
| Retry and concurrency review | Examined duplicate mood requests, concurrent ritual completion, and missing coverage. | Accepted and implemented a prior-day ritual retry regression test; it confirms a 404 response and unchanged rewards/completion state. [Transcript](docs/kiro/concurrency-review.txt) |
| Insights and date logic review | Reviewed inclusive periods, DST boundaries, streaks, ties, and missing energy values. | Verified calculations against existing source and tests; no calculation change was required. [Transcript](docs/kiro/insights-review.txt) |
| Deployment configuration review | Reviewed Docker, Render Free configuration, SPA/API routing, and caching. | Checked recommendations against configuration and routing tests; cloud deployment was verified separately. [Transcript](docs/kiro/deployment-review.txt) |

### Problem solving and verification

- **AI findings:** Kiro raised a JWT-subject issue that source inspection did not support. I retained the existing behavior and preserved the original response for transparency.
- **Missing regression coverage:** its prior-day ritual retry suggestion became an integration test, protecting against accidental reward updates across dates.
- **Safe repeated actions:** unique user/request indexes and replay checks prevent duplicate mood saves; atomic ritual updates award care once.
- **Deployment debugging:** Atlas rejected a connection URI containing leftover password placeholder brackets. Removing those markers resolved authentication; live checks then confirmed MongoDB-backed login and session lookup. No credentials are included in the repository.

The completed application has **55 API tests and 5 local-chat tests**. TypeScript checks, backend checks, and the production build passed. The Kiro evidence records the earlier 48-test review checkpoint separately, rather than presenting later tests as work performed by Kiro.

## Design Philosophy

**Feelings become plants, and small rituals become acts of care.** Every mood has room in the garden. Rituals are invitations, with no penalties for missed days. Insights describe what was recorded; they do not diagnose or interpret emotional health.

## Explaining the project

- [Two-minute architecture explanation and live demo outline](docs/architecture-talk.md)
- [Why I built it this way: interview answers and tradeoffs](docs/design-decisions.md)
- [Recruiter submission review](docs/submission-review.md)

## Known Limitations and Future Improvements

- History is unpaginated for this assessment-sized dataset; explicit pagination is the main scaling improvement. Visible garden rendering stays capped at 12 plants.
- Timeline is limited to the latest 30 calendar days, including for all-time statistics.
- Timezone follows the active browser; travel can regroup historical mood timestamps. Ritual dates retain their saved local-day identity.
- Concurrent entry edits use last-write-wins. Multi-query Insights are near-current rather than a transactional snapshot.
- Browser localStorage exposes Bearer tokens to scripts running on the page. HttpOnly-cookie sessions with CSRF protection and server revocation are possible production hardening; copied JWTs currently remain valid until expiry.
- The optional 3D section adds about 143 kB gzip when it approaches the viewport. It requires WebGL2; unsupported devices get a simpler view. Play actions never create mood entries or ritual rewards. See [3D implementation notes](docs/pocket-garden.md).

## Submission Readiness

- Public repository with source, lockfile, environment examples, and GitHub Actions workflow.
- Live HTTPS application using Render Free and MongoDB Atlas Free.
- Setup/run instructions, architectural decisions, and documented limitations.
- Four specific Kiro tasks with actual review transcripts and a tested accepted suggestion.
- Five screenshots/GIFs using fictional demo data.
- Secrets, local database files, dependencies, and generated builds excluded from Git.

Repository: [Ruchi2117/MoodGardern](https://github.com/Ruchi2117/MoodGardern).

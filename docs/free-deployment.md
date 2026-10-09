# Free deployment

The spending limit for this submission is **$0**. Use one Render **Free** web service and a MongoDB Atlas **M0 Free** cluster. Do not select a paid instance, Flex database, paid add-on, or add a payment method. If a provider requires payment, stop rather than provision it.

## Render + Atlas

1. Create/select an Atlas M0 cluster. Create a database user through Atlas, keep its credentials private, and use a fresh `moodgarden` database. Do not migrate the local development database or personal journal entries.
2. Connect this repository to Render. The `render.yaml` Blueprint explicitly selects `plan: free`; the Dockerfile builds the React client and runs Express as an unprivileged user.
3. Add `MONGODB_URI` as a private Render environment variable. Use the Atlas connection string with the database name and URL-encoded password. Render generates `JWT_SECRET`.
4. Set `CLIENT_ORIGIN` to the exact assigned Render HTTPS origin, without a trailing slash. Set Atlas network access to the service's documented outbound IP ranges. Do not broadly allow all IPs to simplify setup.
5. Deploy, then verify `/api/health`, registration/login, direct navigation and refresh at `/dashboard`, `/journal`, `/insights`, mood CRUD, one-time ritual rewards, logout and account isolation. Check deployment logs without copying secrets.

React uses same-origin `/api`, so one HTTPS service handles both browser routes and API calls. Express serves the SPA shell for application routes while retaining JSON API errors and real missing-asset 404s. Hashed assets are cached; authenticated responses are never cached.

Render Free sleeps after 15 minutes of inactivity and can take about a minute to wake. Do not promise instant availability or add a background keep-awake workaround. Its filesystem is ephemeral; MongoDB belongs on Atlas, not inside the container. Free-tier quotas may suspend service. Atlas M0 has free-tier limits and is not a substitute for a production backup plan.

Sources: [Render free services](https://render.com/docs/free), [Atlas free cluster setup](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).

## Local production smoke test

Build with `npm run build`, then start Express with `NODE_ENV=production`, `SERVE_CLIENT=true`, the local MongoDB URI, a private JWT secret, and `CLIENT_ORIGIN` equal to its local HTTP origin. This validates the actual single-service deployment path before cloud provisioning. Docker image validation and remote availability must be recorded separately; a passing local smoke test does not prove a live deployment.

# Recruiter submission review

Reviewed on 9 October 2026. Target repository: [Ruchi2117/MoodGardern](https://github.com/Ruchi2117/MoodGardern). The repository was empty when supplied, so publishing does not replace existing remote work.

## Ready

- Distinct botanical product identity preserved across authentication, Garden, Journal and Insights.
- Functional MERN data flow, server-side ownership checks, bcrypt/JWT, mood CRUD, idempotent retries, atomic ritual rewards and descriptive analytics.
- Five actual showcase assets, including a seven-second API-backed mood submission GIF. Notes belong to a fictional demo account; no personal journal data is published.
- Reproducible npm workspace setup, committed lockfile, environment examples and isolated MongoDB API tests.
- 55 API tests and 5 local-chat tests pass; TypeScript/backend checks and the production client build pass.
- Published commit `a8176fe` passed [GitHub Actions check/test/build](https://github.com/Ruchi2117/MoodGardern/actions/runs/37919749148). The workflow uses read-only repository permissions.
- Two-minute architecture script and candid decision/tradeoff answers.
- Four genuine Kiro CLI reviews with preserved responses and an accepted regression test; [review evidence](kiro-review.md).
- Docker runtime uses an unprivileged user and serves the SPA and API from one origin. Free Render manifest and Atlas M0 instructions are provided.
- Actual secrets, local database, dependencies, generated build and review staging are ignored.

## Deployment update — 10 October 2026

- Live: https://moodgarden-ruchi2117.onrender.com, using Render Free and Atlas Free.
- Cloud Docker build passed. Public smoke checks verified registration, login, MongoDB-backed session lookup, hash exclusion, duplicate email, incorrect password, malformed registration, invalid/missing tokens, and protected dashboard routing.
- README records the free-tier cold-start behavior. No paid resources were provisioned.

## Candid production limits

Tokens use localStorage and remain valid until expiry if copied. Auth limiting is per process. History is unpaginated; edits use last-write-wins. Free hosting sleeps and has quotas. These are acknowledged tradeoffs, not claims of enterprise readiness. The local Docker daemon did not respond during the earlier review; the subsequent Render Docker build succeeded and the public deployment was smoke-tested.

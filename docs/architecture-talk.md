# Two-minute architecture explanation

Read naturally at roughly 135–145 words per minute. This explains the current implementation, rather than claiming unbuilt features.

> MoodGarden is a mood journal where recorded feelings become a small illustrated garden. I wanted the assessment to feel like a complete product, while keeping the MERN architecture easy to explain.
>
> The frontend uses React and TypeScript, with one typed API client. AuthContext manages the current session, and a shared mood-history context keeps the Garden, Journal, and recent feelings synchronized. The garden is a presentation component: it derives plants from saved entries rather than storing another copy of the same information.
>
> Express exposes authenticated REST endpoints. Mongoose models persist users, mood entries, and daily rituals in MongoDB. Passwords are hashed with bcrypt. JWT middleware verifies each Bearer token, and every data query uses the authenticated user ID. The client cannot choose which user’s records to access.
>
> I paid particular attention to retries and concurrency. Mood submissions use a client request ID with a user-scoped unique index, so an uncertain retry does not plant twice. Each user has one ritual set per local calendar day. Ritual completion and growth are updated atomically, so repeated clicks cannot award growth again.
>
> Insights are calculated on the server from recorded data. They describe counts, energy, and local-day patterns, without AI or psychological interpretation. Ties and missing data are handled explicitly.
>
> The visual garden uses SVG and CSS, capped at twelve visible plants. That keeps rendering predictable and responsive, while retaining the product’s personality. I tested ownership, validation, timezones, and concurrent requests with isolated real MongoDB instances, then checked keyboard access, mobile layouts, and network failures in the browser.

## A short live demo

- 0:00–0:20 — Explain “feelings become plants; rituals become care.”
- 0:20–0:45 — Save a mood and show the resulting plant.
- 0:45–1:05 — Open/edit that thought in Journal.
- 1:05–1:20 — Complete a ritual; explain one-time growth.
- 1:20–1:45 — Show descriptive Insights and period controls.
- 1:45–2:00 — Mention ownership, idempotency, real MongoDB tests, and one acknowledged scaling tradeoff.

# MoodGarden final review

Reviewed October 9, 2026 (Asia/Calcutta). No product features were added. The approved botanical garden, typography, backgrounds, and navigation structure remain intact.

## Genuine issues corrected

- Production previously bound only to loopback. Validated environment now chooses a public bind in production, requires an explicit frontend origin, and accepts a documented trusted proxy-hop count.
- Frontend now accepts a build-time VITE_API_URL, with same-origin /api as the default.
- API privacy/security headers, a bounded process-local auth-attempt limiter, all model index initialization before serving, and MongoDB shutdown handling were added without new dependencies.
- Late auth requests could affect a newer session. Session versions/cancellation now guard logout, restoration, and sign-in. Mood-history errors also guard against logging out a changed account.
- Auth submissions have a synchronous lock and disabled fields during requests.
- Added a keyboard skip link and main landmarks. Mood emoji are decorative alongside explicit text/pressed state. Energy/timeline graphics have meaningful roles and labels.
- Journal dialog modes focus the heading, thought field, or safe Keep action; closing restores the opening card or Journal heading. Escape and focus trapping were checked.
- Measured low-contrast muted text was adjusted within the existing sage family. Illustration fills and page backgrounds were preserved. Insight selected controls retain adequate light-text contrast. Journal search has a visible focus-within state.
- A four-pixel overflow at 320px was corrected by matching garden margins to narrow-screen shell padding. Mood controls wrap intentionally at this width. Long names and uninterrupted notes wrap rather than expanding the page.
- The garden now slices to its visible limit before mapping, keeping plant preparation bounded at 12 while preserving original chronological slot indices.
- Landing copy no longer presents completed work as “Phase 01 / Foundation.” Its layout and illustration remain intact.
- README was rewritten as a current project guide with setup, real screenshots, architecture, deployment steps, API behavior, testing, and honest AI-tool disclosure.

## Accessibility and responsive evidence

Six routes × eight widths = 48 layout checks: /, /login, /register, /dashboard, /journal, /insights at 320, 375, 390, 430, 768, 1024, 1280, 1440 pixels. No document horizontal overflow remained. Each completed page has one main landmark and one h1. Raw measurements: final-responsive-audit.json.

Rendered text measurement checked direct visible HTML text against composited solid backgrounds, including ancestor opacity and large-text thresholds. No failures remained on the reviewed routes. This complements keyboard/visual inspection; it is not a formal WCAG certification or a complete gradient/image/pseudo-element audit. Placeholder colors and reduced-motion CSS were also reviewed. Existing global reduced-motion rules disable animations/transitions and smooth scrolling.

At 320px, a 2,000-character note including an uninterrupted string wrapped inside the Journal card/dialog. Dialog clientWidth and scrollWidth were both 250px. Shift+Tab stayed inside the modal; edit mode focused the note field; Escape closed it and restored focus to the Journal card. Destructive confirmation keeps the safe action first.

A disposable QA dataset verified 15 persisted feelings, exactly 12 rendered plants, deterministic arrangement after refresh, and a single-plant state. QA entries are removed after review; original saved thoughts are preserved.

## Failure and recovery review

The real API was temporarily stopped. Failed mood submission and Journal edits retained drafts; ritual completion remained incomplete; Journal and Insights showed useful error/retry states. Restoring the real API recovered the history without changing existing entries. Intentional network failures are expected in those test tabs, not suppressed application errors.

A temporary loopback-only test responder returned the same 401 shape used for expired/invalid sessions. Refresh redirected to login and cleared the browser session; the real API was then restored. Actual invalid/expired JWT verification remains covered by API integration tests. Clean-session normal flows are reviewed separately from these intentionally failing tabs.

## Verification

- All 44 API tests pass, retaining the original 38 and adding six production/security cases.
- Frontend TypeScript and backend syntax checks pass.
- Production build passes.
- Production dependency audit: zero reported vulnerabilities at review time.
- User email, user-scoped mood request ID, and ritual user/date indexes reviewed.
- .env, node_modules, build artifacts, tsbuildinfo, and local MongoDB files are ignored.

## Hiring-manager assessment

The app demonstrates real MERN work: three persistent models, validated REST APIs, password hashing and JWT sessions, consistent ownership, retry/concurrency guarantees, and readable deterministic calculations. The approved UI is coherent across Garden, Journal, Rituals, and Insights. Loading/error/empty states and mobile behavior have been exercised. The README explains choices and limitations a candidate should be able to discuss.

Remaining submission items: actual Kiro/Code0 evidence is not available, and no GitHub remote is configured. Neither tool usage, commit history, deployment, nor a remote repository is fabricated. Deployment verification remains necessary on the chosen hosting platform. No new feature phase was started.

A production-mode backend was smoke-tested on a temporary loopback port: health returned 200 with the configured exact CORS origin and no-store header. A split-hosting build embedded the configured HTTPS API URL, then the default same-origin build was restored. Full dependency audit (including development dependencies) also reported zero vulnerabilities.

After the interrupted preview was restarted, a fresh browser session loaded Landing, Garden, Journal, and Insights with no console warnings or errors. The skip link focused main-content. The persisted original account still had three feelings and 39 growth points; the disposable account was restored to zero entries.

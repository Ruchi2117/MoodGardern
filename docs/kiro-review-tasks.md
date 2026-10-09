# Genuine Kiro/Code0 review tasks

Status: prepared prompts, **not evidence of completed tool usage**. The initial implementation used Codex. Run these tasks in the required tool, preserve its actual responses, review the findings, and record what was accepted/rejected and how it was verified.

Never give the tool .env files, credentials, local database files, node_modules, generated builds, or private journal data. Review source and isolated tests only. Do not add product features or redesign the approved garden.

## 1. Ownership and authentication review
Review server/src/middleware/authMiddleware.js, controllers/authController.js, controllers/moodController.js, and tests/auth.test.js + moods.test.js. Identify a concrete authorization/validation issue only if the source proves it. Cite file/line references and suggest a focused regression test. Do not modify files yet.

## 2. Retry and concurrency review
Review MoodEntry’s user-scoped idempotency index and mood creation replay logic, plus Ritual’s user/date index and atomic completion. Walk through simultaneous requests and lost responses. Distinguish proven bugs from limitations. Suggest one useful missing test; do not duplicate current tests.

## 3. Local-day and Insight calculation review
Review insightService.js and ritualService.js, with existing date/energy/tie tests. Check inclusive 7/30-day windows, DST boundaries, yesterday-active streaks, multiple entries per day, and missing energy. Give concrete counterexamples if something is wrong.

## 4. Deployment and documentation review
Review Dockerfile, railway.json, production static-file handling, environment validation, and README deployment instructions. Identify missing runtime files, secret leakage, broken SPA routes, or documentation mismatches. Keep MERN and the existing visual design unchanged.

## Evidence record for each actual task
- Tool and installed version/surface:
- Date:
- Exact prompt:
- Files reviewed:
- Response/transcript path:
- Finding:
- Accepted/rejected reasoning:
- Actual change/commit, if any:
- Commands/tests and observed results:

Do not fill these fields with hypothetical or Codex-authored findings. Read-only reviews can be useful real tasks; claim their actual scope rather than pretending the tool built the initial app.

Official references: https://kiro.dev/docs/cli/setup/ and https://kiro.dev/docs/cli/headless/

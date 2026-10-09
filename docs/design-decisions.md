# Why did you build it this way?

## Why MongoDB?
Mood entries naturally group a mood, optional thought, activity list, energy, owner, and timestamps. MongoDB fits those documents; Mongoose supplies validation and a clear schema. Compound indexes support ownership-scoped reads and enforce the invariants that matter. The database is doing real persistence and concurrency work, rather than simply storing demo text.

## Why derive the garden instead of creating a Garden model?
A plant represents a MoodEntry. Storing the same event in two models would create synchronization problems when someone edits or deletes a thought. Deriving the garden gives one source of truth, with the visual renderer kept separate from data orchestration.

## Why a unique idempotency key rather than disabling the button?
Disabling the button prevents most repeated clicks, but cannot resolve a request whose response is lost after the database saves it. Keeping an unchanged draft’s request ID and enforcing a user-scoped unique index makes retries safe, including concurrent requests. Conflicting content under one ID gets a 409.

## Why atomic ritual completion?
The completion flag, timestamp, and growth reward belong to one document. A conditional update changes them together only when the task is incomplete. It avoids a read-then-write race and does not require a transaction across unrelated collections.

## Why React Context instead of Redux?
There are two modest shared concerns: authentication and mood history. Context handles them without another library or a complicated state layer. Local form and filter state remain near their components. If the application’s state becomes substantially more complex, I would reassess this choice.

## Why calculate Insights on the server?
The API can enforce ownership once, use aggregation, and return only the fields the page needs. It avoids transferring private journal notes just to count moods, and keeps important calculations consistent between clients.

## Why no AI-generated observations?
Simple counts and recorded-day patterns are deterministic, testable, and easy to verify. The app should help someone notice what they recorded without making unsupported claims about their emotional health.

## Why SVG/CSS instead of Three.js?
The garden is memorable without a large 3D runtime. A fixed visible plant limit, stable slots, and transform/opacity animation make performance predictable. It also works with reduced motion. Optional 3D could be explored later; it is not necessary to demonstrate the product or MERN skills.

## Why these tests?
The risky behavior is at API/database boundaries: ownership, input validation, invalid tokens, retries, concurrency, and local dates. Integration tests with a real isolated MongoDB instance cover those behaviors instead of only mocking the implementation. Browser checks cover the interaction and layout layer.

## Why JWT in localStorage, and what is the tradeoff?
It matches the requested Bearer-token flow and gives simple refresh persistence. I would not describe it as the strongest possible session design: page scripts can access localStorage, and copied tokens remain valid until expiry. A broader production session design could use HttpOnly cookies, CSRF protection, and revocation.

## What would you change at scale?
Add explicit history pagination and garden summary queries, a shared edge rate limiter, and more deliberate timezone/account-session policies. I would not add microservices just because the project grew; the current boundaries are clear and can be measured first.

## How did you use AI tools?
Codex assisted the implementation and verification documented in README. Kiro/Code0 must be reported separately only after actual runs and review evidence exist. Explain one concrete finding, the change accepted or rejected, and the test that verified it. Never rename one tool as another.

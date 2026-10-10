# Woodland companion and chat

Fern's latest 3D interpretation is based on the supplied bluebell-traveler illustration: a curved scalloped bluebell hat and lobes, pointed ears, cream blouse, leafy collar, navy shorts, striped socks, green shoes, a cross-body satchel and tied flower bundle. Its identity colors stay fixed; customization now controls the toy casing and optional outfit pins. It is a procedural interpretation of the reference, not an exact authored character asset. Cursor orbit and integrated toy chat remain in place.

The corrected pocket toy contains chat **inside its LCD screen**, with A for water and B for an original motivational reminder. Day, sleep, movement, motivation, text input and chat modes live in that screen. The 3D preview is now a rounded, pear-shaped woodland creature with tucked paws and a cream belly, replacing the pot/stick silhouette. Cursor/touch dragging rotates it freely with bounded vertical orbit; the button remains a keyboard alternative. Dragging does not accidentally trigger a tap reaction.

The visual update adds original SVG woodland mood faces and a matching favicon, a scarf/ear silhouette for the 3D friend, three color palettes, three accessories, an editable name, and a pocket toy with a daisy badge, embossed label, bounded inspection turns and soft rocking/press animation. Existing landing layout and primary garden are retained.

Sounds are synthesized locally using Web Audio. They are quiet, opt-in, and triggered by interactions/replies; no music autoplays and no sound files are downloaded. Customization is stored locally under an account-specific key. Chat and its water check-in remain in memory only, clear on leaving the dashboard/logout, and reset water on a new local day.

## Local chat

Explicitly labeled **guided replies**, not generative AI. It follows simple day, water, sleep and movement topics, supports follow-up questions and conversational prompts, and admits when a topic is outside its limits. A count such as “3 glasses” records a session check-in without a hydration target or reward. It never changes mood entries or ritual completion.

Habit wording was checked against [CDC water guidance](https://www.cdc.gov/healthy-weight-growth/water-healthy-drinks/) and [CDC sleep guidance](https://www.cdc.gov/sleep/about/). It does not diagnose, prescribe medication, set fluid targets or praise unusually high intake. Medical/crisis language gets appropriate referral rather than a routine habit response.

## Optional AI mode

**Left disconnected at the user's request. No provider has been provisioned and no paid AI calls were made.**

The server supports an OpenAI-compatible HTTPS chat-completions endpoint. Set these private server environment variables only after choosing and authorizing a provider and its budget:

```text
COMPANION_API_URL=
COMPANION_API_KEY=
COMPANION_MODEL=
```

Restart the server after configuring them. `/api/companion/status` exposes only availability. `/api/companion/chat` requires a valid JWT and existing account, accepts up to 20 messages of 1,000 characters, rejects client system roles, applies 10 requests/IP/minute, enforces a 20-second timeout and bounds replies. Provider credentials and provider errors never reach the client. Journal data is never automatically attached. The UI explains that sending in AI mode shares that chat with the configured provider and can incur charges. It does not silently substitute a local reply for a failed AI call.

AI plumbing was tested with an injected provider stub, not a live AI account. It must still be verified with the chosen provider before describing real AI chat as operational. Process-local rate limiting is not a spending cap or a guarantee of model safety.

## Verification

- 55 API tests passed, including seven new companion tests for authentication/deleted users, configuration, bounded input, server-owned instructions, safe errors and request limiting.
- Five local-conversation tests passed for contextual water counts, sleep follow-ups, medical/crisis handling and disclosed limitations.
- TypeScript/backend checks and frontend production build passed.
- Browser checks: local water/sleep follow-ups, unconfigured AI state, rose color/mushroom accessory, opt-in sound controls, and no console errors during these interactions.
- The optional Three.js chunk still has a Vite size advisory; it remains lazy loaded. The original renderer and core data flows do not depend on it.

Fern's face, blouse, shorts, limbs, shoes, satchel and flower bundle now use shaped profile surfaces rather than scaled spheres. Clothing seams, leather stitching, integrated blush and directional contact shadows add definition. Cursor dragging remains available. This remains a stylized procedural character interpretation.

The latest silhouette revision uses a continuous scalloped flower cap, shaped hair, narrower facial proportions, smaller ears, contoured palms and a structured bottle. Brows and mouth sit against the facial surface. Browser rotation and rendering were checked.

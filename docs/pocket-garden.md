# Interactive pocket garden

Added at the user's request on 10 October 2026, preserving the existing landing page and main SVG garden. This extends the earlier finished submission; it does not replace its visual identity.

Three selectable views share one renderer:

- **Little friend:** a locally modelled sprout in a clay pot. Tapping it waves; the pointer gently tilts the scene. It blinks and bounces during a short celebration.
- **Pocket toy:** a rounded, extruded retro handheld. Its pink 3D button makes rain, yellow button waves, and cross rotates the device. The buttons depress briefly when used.
- **Garden in 3D:** a miniature island with the latest saved mood entries, capped at the shared 12-plant limit and colored from the shared mood mapping. Tap a flower for pretend rain or rotate with the HTML control.

Successful mood saves and ritual completions trigger celebration through the existing `plantedId` and `care` state. Failed requests do not trigger it. Wave/rain/rotation are play only and never write to the API, add growth or mark rituals complete.

The component imports its Three.js scene when approaching the viewport. There are no scene downloads, textures, account requirements or paid assets. It uses capped pixel density, native geometry and short animation bursts. The render loop stops when idle, off-screen or the document is hidden. Reduced-motion preference disables animated reactions and pointer tilt while retaining user-controlled rotation and status feedback. Geometry, materials, observers and listeners are disposed on unmount. Unsupported/lost WebGL uses a simpler placeholder without obstructing the rest of the application.

## Verification

- Frontend TypeScript/backend checks and production build pass.
- Browser checks cover all three views, direct raycast interaction with the handheld's pink button, keyboard rotation, a single canvas after view changes, and no horizontal overflow at 320 pixels.
- A real local demo mood submission triggered celebration and increased the miniature from eight to nine saved flowers. The created test entry was then cleaned up, retaining a local backup; the original eight demo entries were preserved.
- Existing backend behavior is unchanged; the previously passing 48 API tests are not a claim of new browser automation coverage.
- The WebGL chunk is approximately 559 kB minified / 143 kB gzip, separate from the initial application chunk. Vite emits a size advisory for it; lazy loading limits when it is fetched rather than hiding that cost.

Implementation: `PocketGarden.tsx` handles React state and accessible controls; `pocketScene.ts` owns rendering, geometry, raycasting and cleanup; `pocket-garden.css` styles the added section. [Three.js raycasting](https://threejs.org/docs/pages/Raycaster.html) and [renderer lifecycle](https://threejs.org/docs/pages/WebGLRenderer.html) were checked against the official documentation.

# Scene Testing Policy

## Goal

Treat the frontend as a scene-first shell, not a DOM dashboard.
The primary test surface is the Three.js scene contract, with screenshots reserved for last-resort visual regression.

## Test Layers

1. Scene contract tests
   - Use `window.__ACIDNET_DEBUG__`.
   - Read scene state through `getSceneSnapshot()`.
   - Assert camera, interaction targets, visible env layers, renderer counters, and stable `testId` nodes.

2. Interaction contract tests
   - Drive the scene through stable world-target ids.
   - Use `activateTargetByTestId()` instead of brittle pixel clicking when testing intent routing.
   - Assert emitted commands and state transitions.

3. Visual regression tests
   - Use screenshots only for a small set of curated states.
   - Only after shader warm-up and fixed viewport/DPR/state.
   - Never make screenshots the first-line test for scene correctness.

4. GPU forensics
   - Opt-in only.
   - Use `?debugGpu=1` or `__ACIDNET_DEBUG__.installGpuInspector()`.
   - Capture frames with Spector.js only when scene/render debugging requires draw-call inspection.

## Stable Scene Instrumentation

- Every scene-critical `Object3D` should carry `userData.testId`.
- Use semantic ids, not positional ids:
  - `env:village`
  - `env:road`
  - `npc:npc.mara`
  - `npc-hit:npc.mara`
  - `route:route.greenfall.shrine`
  - `route-hit:route.greenfall.shrine`

## Playwright Rules

- Mock `/api/state`, `/api/events`, and `/api/command` for deterministic scene tests.
- Prefer `browserContext.addInitScript()` to inject deterministic test flags before the app boots.
- Prefer `page.evaluate()` over DOM scraping when checking scene state.
- If WebGL is unavailable in the current Playwright browser, skip renderer-dependent scene assertions and still verify that the debug surface boots.

## Current Commands

- `npm test`
- `npm run test:scene:headed`
- `npm run test:scene:debug`
- `npm run test:scene:ui`

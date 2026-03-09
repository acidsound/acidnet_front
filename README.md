# acidnet_front

Scene-first frontend shell for the AcidNet simulation.

This repo is not a copy of the old web UI. Its purpose is to build a different visual shell on top of the same server contract, with:

- first-person movement
- 3D settlement / road presentation
- Desktop + Mobile + XR interaction paths
- scene contract testing for Three.js state

## Purpose

`acidnet_front` is the frontend sandbox for experimenting on the presentation layer without rewriting the simulator itself.

The main implementation lives at:

- [`src/acidnet/frontend/client/index.html`](src/acidnet/frontend/client/index.html)

The simulator API it expects is the existing AcidNet web contract:

- `GET /api/state`
- `GET /api/events`
- `POST /api/command`
- `GET /api/dialogue-prompt`

## Demo Mode

You can run the frontend without the simulator backend.

### Static preview

```sh
cd src/acidnet/frontend/client
python3 -m http.server 4173
```

Then open:

- [http://127.0.0.1:4173/?demo=1](http://127.0.0.1:4173/?demo=1)

`?demo=1` uses an embedded offline state instead of `/api/*`.

## Live Simulator Connection

For normal development, run the existing simulator on `:8765` and use the local proxy in this repo.

### Proxy frontend to simulator

```sh
npm install
npm run dev:proxy
```

Default routing:

- page: `http://127.0.0.1:4173/`
- API proxy: `http://127.0.0.1:4173/api/*`
- upstream simulator: `http://127.0.0.1:8765`

Environment overrides:

- `HOST`
- `PORT`
- `API_ORIGIN`

## XR Notes

XR was built for Quest-class WebXR browsers, but there are a few hard constraints.

- WebXR needs `https://` on Quest. Plain LAN `http://` will not enable XR.
- The page and `/api/*` must share the same HTTPS origin.
- `Enter XR` must be triggered by a direct user gesture.
- For remote Quest testing, tunnel the proxy server, not the simulator server directly.

### Pinggy example

Run the proxy first, then expose it:

```sh
ssh -p 443 -R0:localhost:4173 a.pinggy.io
```

Open the HTTPS Pinggy URL on Quest.

### XR interaction

- Left stick: locomotion
- Right stick: radial menu selection / turn
- Trigger: activate hovered target or selected radial action
- Action menu: shared concept with Desktop, but adapted for XR controller input

### XR caveats

- Use the proxy or another same-origin HTTPS gateway. `https page -> http api` will fail.
- If XR start fails, the frontend now surfaces the failure message in the XR status text as well as the dialog.
- XR panels are intentionally different from Desktop panels and are laid out for center-lower viewing.

## Desktop Notes

- Click empty scene to capture the mouse
- `WASD` to move
- Mouse to look
- `E` or `Tab` opens the action menu
- While the action menu is open, mouse movement selects menu wedges instead of rotating the camera

## Tests

Install Playwright once:

```sh
npm install
```

Run tests:

```sh
npm test
```

Scene testing policy:

- [`SCENE-TESTING.md`](SCENE-TESTING.md)

UI naming / layout reference:

- [`UI-LAYOUT.md`](UI-LAYOUT.md)

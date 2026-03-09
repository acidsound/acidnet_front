# UI Layout

This document defines the current Three.js overlay UI as named layout elements.
Use these names when giving placement or visibility feedback.

## Scope

- This describes the visible in-scene UI rendered by Three.js.
- It does not describe hidden DOM fallback/debug markup.
- Coordinates are expressed as screen anchors, not CSS boxes.

## Layout Principles

- The scene remains primary. UI must not sit on the visual center unless it is transient.
- Persistent UI belongs on edges and corners.
- Center-screen space is reserved for world navigation, reticle targeting, and character reading.
- Mobile, Desktop, and XR share the same semantic UI elements even when placement differs.

## Named Elements

### `reticle`

- Role: center aiming point for NPC focus, route gates, and XR/world targeting.
- Visibility: always visible during world control.
- Default position: exact screen center.
- Interaction: changes state for `idle`, `npc`, and `route`.

### `status`

- Role: compact persistent status strip.
- Content:
  - location name
  - day / tick
  - weather
  - nearby count or road-lock status
  - quick buttons for focus panel, ledger, and XR
- Visibility: always visible.
- Current anchor:
  - Desktop: top-left, very tight to the corner
  - Mobile: top-left, very tight to the corner
  - XR: equivalent quick status panel in spatial UI

### `note`

- Role: transient contextual hint line.
- Content:
  - `Look at ...`
  - focus guidance
  - road-state guidance
  - hover/focus explanations
- Visibility: shown when there is relevant context.
- Current anchor:
  - Desktop: lower center
  - Mobile: lower center
  - XR: equivalent guidance panel in spatial UI

### `world`

- Role: local area state panel.
- Content:
  - settlement pulse
  - local events
  - road actions when traveling
  - blocked actions during road lock
- Visibility:
  - visible when this information panel is enabled in the overlay
  - most important for settlement/road state explanation
- Current anchor:
  - Desktop: left column under `status`
  - Mobile: top area under `status`
  - XR: left spatial panel

### `feed`

- Role: recent event log.
- Content:
  - recent events
  - event kind
  - day / tick
- Visibility:
  - visible in non-compact overlay layouts
  - can be hidden in compact layouts
- Current anchor:
  - Desktop: top-center column
  - Mobile: stacked panel when shown
  - XR: center spatial panel

### `focus`

- Role: close interaction panel for NPC-focused actions.
- Content:
  - target summary
  - nearby selectable people
  - target actions
  - quick trade actions
- Visibility:
  - toggled by `E`
  - also meaningful during road state when close local focus is unavailable
- Current anchor:
  - Desktop: right column
  - Mobile: stacked panel
  - XR: right spatial panel

### `touch`

- Role: mobile touch action rail.
- Content:
  - focus toggle
  - ledger toggle
  - use / next
  - look
  - XR entry when available
- Visibility:
  - intended for touch/mobile layouts
- Current anchor:
  - Desktop: may exist but should not dominate
  - Mobile: bottom center
  - XR: not used as a touch strip

## World-Space Labels

These are not overlay panels, but they are visible UI elements.

### `npc labels`

- Role: identify nearby characters.
- Position: attached to NPCs in world space.
- Trigger: proximity, hover, or focus state.

### `route / gate labels`

- Role: identify exits and travel destinations.
- Position: attached to route gates in world space.
- Trigger: visibility, hover, or route interaction state.

## Interaction Rules

- `E`: toggles `focus`
- `Tab`: toggles ledger-style secondary information
- Mouse click:
  - UI hotspot click activates that hotspot
  - empty-world click should favor pointer capture
- XR trigger:
  - activates hovered UI hotspot or world target

## Review Format

When requesting layout changes, refer to elements by name:

- `status -> move to bottom-left`
- `note -> hide unless hovering npc`
- `world -> reduce width by 20%`
- `focus -> only open on E`
- `feed -> remove from default desktop layout`

## Implementation References

- Overlay creation: [/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html](/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html)
- Panel creation: [/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L4800](/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L4800)
- Overlay layout: [/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L4911](/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L4911)
- Status panel draw: [/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L5400](/Users/spectrum/Documents/works/acidnet_front/src/acidnet/frontend/client/index.html#L5400)

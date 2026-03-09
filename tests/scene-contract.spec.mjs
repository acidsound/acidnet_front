import { test, expect } from "@playwright/test";
import { buildRoadState, buildVillageState } from "./scene-fixtures.mjs";

async function mockFrontendApi(page, state, seenCommands = []) {
  let currentState = structuredClone(state);

  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(currentState),
    });
  });

  await page.route("**/api/events*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        after_seq: currentState.latest_event_seq,
        latest_event_seq: currentState.latest_event_seq,
        state_version: currentState.state_version,
        timed_out: true,
        reset_required: false,
        events: [],
      }),
    });
  });

  await page.route("**/api/command", async (route) => {
    const payload = JSON.parse(route.request().postData() || "{}");
    seenCommands.push(payload.command);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        command: payload.command,
        command_id: `cmd-${seenCommands.length}`,
        state_version: currentState.state_version + 1,
        latest_event_seq: currentState.latest_event_seq + 1,
        entries: [{ kind: "system", text: `Accepted ${payload.command}` }],
        state: currentState,
      }),
    });
  });

  return {
    seenCommands,
    setState(nextState) {
      currentState = structuredClone(nextState);
    },
  };
}

async function openScene(page, state) {
  await page.context().addInitScript(() => {
    globalThis.__ACIDNET_TEST_FLAGS__ = { deterministic: true };
    Math.random = () => 0.25;
  });
  await mockFrontendApi(page, state);
  await page.goto("/");
  await page.waitForFunction(() => globalThis.__ACIDNET_DEBUG__?.getState?.()?.world?.location_name != null);
}

async function sceneSnapshot(page) {
  return page.evaluate(() => globalThis.__ACIDNET_DEBUG__.getSceneSnapshot());
}

test("debug surface boots and reports renderer availability", async ({ page }) => {
  await openScene(page, buildVillageState());

  const snapshot = await sceneSnapshot(page);

  expect(snapshot.world.locationName).toBe("Market Square");
  expect(snapshot.ui.reticleNote).toContain("Look at someone in the square");
  expect(typeof snapshot.ready).toBe("boolean");
});

test("scene debug surface exposes village contract without screenshots", async ({ page }) => {
  await openScene(page, buildVillageState());

  const snapshot = await sceneSnapshot(page);
  test.skip(!snapshot.ready, "WebGL is unavailable in the current Playwright browser; scene contract checks require a live Three renderer.");

  expect(snapshot.ready).toBe(true);
  expect(snapshot.travel.isTraveling).toBe(false);
  expect(snapshot.world.locationName).toBe("Market Square");
  expect(snapshot.renderer.calls).toBeGreaterThan(0);
  expect(snapshot.canvas.cssWidth).toBeGreaterThan(0);
  expect(snapshot.interactionTargets).toEqual(expect.arrayContaining([
    "npc-hit:npc.mara",
    "npc-hit:npc.neri",
    "route-hit:route.greenfall.shrine",
  ]));
  expect(snapshot.nodes.find((node) => node.testId === "env:village")?.visible).toBe(true);
  expect(snapshot.nodes.find((node) => node.testId === "env:road")?.visible).toBe(false);
  expect(snapshot.nodes.find((node) => node.testId === "npc:npc.mara")).toBeTruthy();
});

test("road state reads as an exit-lock with progress and blocked actions", async ({ page }) => {
  await openScene(page, buildRoadState());

  const snapshot = await sceneSnapshot(page);
  test.skip(!snapshot.ready, "WebGL is unavailable in the current Playwright browser; road scene checks require a live Three renderer.");

  const road = await page.evaluate(() => ({
    scene: globalThis.__ACIDNET_DEBUG__.getSceneSnapshot(),
    heroCopy: document.getElementById("hero-copy")?.textContent,
    summary: document.getElementById("travel-summary-line")?.textContent,
    progressValue: document.getElementById("travel-progress-value")?.textContent,
    progressCount: document.getElementById("travel-progress-actions")?.children.length,
    supportCount: document.getElementById("travel-support-actions")?.children.length,
    blockedCount: document.getElementById("travel-blocked-actions")?.children.length,
    tradeHidden: document.getElementById("trade-slab")?.hidden,
    focusTitle: document.querySelector("#focus-inner .focus-title")?.textContent,
  }));

  expect(road.scene.travel.isTraveling).toBe(true);
  expect(road.scene.travel.ticksRemaining).toBe(6);
  expect(road.scene.nodes.find((node) => node.testId === "env:road")?.visible).toBe(true);
  expect(road.scene.nodes.find((node) => node.testId === "env:village")?.visible).toBe(false);
  expect(road.heroCopy).toContain("temporary lock");
  expect(road.summary).toContain("travel clock reaches zero");
  expect(road.progressValue).toContain("ticks until release");
  expect(road.progressCount).toBe(2);
  expect(road.supportCount).toBe(1);
  expect(road.blockedCount).toBe(3);
  expect(road.tradeHidden).toBe(true);
  expect(road.focusTitle).toBe("A lock that opens only at zero");
});

test("stable world-target ids can drive interaction commands", async ({ page }) => {
  const seenCommands = [];
  await page.context().addInitScript(() => {
    globalThis.__ACIDNET_TEST_FLAGS__ = { deterministic: true };
    Math.random = () => 0.25;
  });
  await mockFrontendApi(page, buildVillageState(), seenCommands);
  await page.goto("/");
  await page.waitForFunction(() => globalThis.__ACIDNET_DEBUG__?.getState?.()?.world?.location_name != null);

  const snapshot = await sceneSnapshot(page);
  test.skip(!snapshot.ready, "WebGL is unavailable in the current Playwright browser; target activation checks require scene interaction targets.");

  const npcActivated = await page.evaluate(() => globalThis.__ACIDNET_DEBUG__.activateTargetByTestId("npc-hit:npc.mara"));
  const routeActivated = await page.evaluate(() => globalThis.__ACIDNET_DEBUG__.activateTargetByTestId("route-hit:route.greenfall.shrine"));

  await expect.poll(() => seenCommands.length).toBe(2);
  expect(npcActivated).toBe(true);
  expect(routeActivated).toBe(true);
  expect(seenCommands).toEqual(["focus npc.mara", "travel-region Dawn Shrine"]);
});

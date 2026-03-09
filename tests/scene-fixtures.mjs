export function buildVillageState() {
  return {
    state_version: 7,
    latest_event_seq: 44,
    dialogue: {
      ready: true,
      loading: false,
      message: "RuleBasedDialogueAdapter ready.",
      backend: "RuleBasedDialogueAdapter",
    },
    world: {
      day: 1,
      tick: 24,
      weather: "dry_wind",
      field_stress: 0.36,
      scarcity_index: 0.18,
      market_prices: { bread: 5, fish: 4, stew: 8, tool: 16, wheat: 2 },
      location_id: "square",
      location_name: "Market Square",
      region_id: "region.greenfall",
      region_name: "Greenfall Village",
      active_events: [
        {
          event_id: "event.route.route.greenfall.stonewatch.delay",
          event_type: "route_delay",
          summary: "The road toward Stonewatch Outpost is slowing under the dry wind, and caravans are arriving late.",
        },
      ],
    },
    player: {
      name: "Player",
      location_id: "square",
      money: 35,
      hunger: 15.2,
      fatigue: 6,
      carried_weight: 0.5,
      carry_capacity: 14,
      focused_npc_id: null,
      inventory: [{ item: "bread", quantity: 1 }],
      debts: [],
      travel_state: {
        is_traveling: false,
        route_id: null,
        origin_location_id: null,
        destination_location_id: null,
        ticks_remaining: 0,
        risk_budget: 0,
      },
    },
    actions: {
      common: [
        { label: "Look", command: "look", enabled: true, blocked_reason: null },
        { label: "Work", command: "work", enabled: true, blocked_reason: null },
        { label: "Meal", command: "meal", enabled: true, item: "bread", blocked_reason: null },
        { label: "Rest", command: "rest 1", enabled: true, blocked_reason: null },
        { label: "Sleep", command: "sleep 3", enabled: true, blocked_reason: null },
        { label: "Next", command: "next 1", enabled: true, blocked_reason: null },
      ],
      consume: [
        { label: "Eat Bread", command: "eat bread", item: "bread", quantity: 1 },
      ],
      target: [
        { label: "Inspect", command: "inspect", requires_target: true, enabled: false, blocked_reason: "No interaction target selected." },
        { label: "Talk", command: "talk", requires_target: true, enabled: false, blocked_reason: "No interaction target selected." },
        { label: "Ask Rumor", command: "ask rumor", requires_target: true, enabled: false, blocked_reason: "No interaction target selected." },
      ],
      travel: [
        {
          label: "Travel to Dawn Shrine",
          command: "travel-region Dawn Shrine",
          enabled: true,
          kind: "regional",
          destination_location_id: "shrine",
          destination_region_id: "region.shrine",
          travel_ticks: 24,
          travel_turns: 2,
          blocked_reason: null,
          route_id: "route.greenfall.shrine",
        },
      ],
    },
    scene: {
      description: "You are at Market Square [market]. Stalls stay open under the dry wind while people keep talking around the square.",
      people: [
        {
          npc_id: "npc.mara",
          name: "Mara",
          profession: "merchant",
          mood: "guarded",
          is_vendor: true,
          is_target: false,
          stock: [{ item: "bread", quantity: 6 }],
          buy_options: [{ item: "bread", quantity: 6, price: 5 }],
          sell_options: [],
          ask_options: [],
          give_options: [],
          debt_options: [],
        },
        {
          npc_id: "npc.neri",
          name: "Neri",
          profession: "porter",
          mood: "tired",
          is_vendor: false,
          is_target: false,
          stock: [],
          buy_options: [],
          sell_options: [],
          ask_options: [],
          give_options: [],
          debt_options: [],
        },
      ],
      rumors: [
        { content: "The shrine road is holding, but the wind is making everyone impatient.", confidence: 0.7 },
      ],
      route_preview: [
        {
          connection_kind: "regional",
          destination_location_id: "shrine",
          destination_region_id: "region.shrine",
          destination_name: "Dawn Shrine",
          command: "travel-region Dawn Shrine",
          travel_ticks: 24,
          travel_turns: 2,
          enabled: true,
          blocked_reason: null,
          route_id: "route.greenfall.shrine",
          status: "ready",
          status_summary: null,
        },
      ],
      map_nodes: [
        { location_id: "square", name: "Market Square", kind: "market", row: 2, column: 2, glyph: "+", is_player_here: true, is_adjacent: true, is_reachable: true, move_command: "look", connection_kind: "local", occupant_count: 3 },
        { location_id: "shrine", name: "Dawn Shrine", kind: "gate", row: 2, column: 4, glyph: "R", is_player_here: false, is_adjacent: false, is_reachable: true, move_command: "travel-region Dawn Shrine", connection_kind: "regional", occupant_count: 0 },
      ],
      map_edges: [
        { from_location_id: "square", to_location_id: "shrine", kind: "regional", route_id: "route.greenfall.shrine", is_delayed: false },
      ],
      regional_nodes: [
        {
          region_id: "region.greenfall",
          name: "Greenfall Village",
          kind: "settlement",
          summary: "A village square where trade and rumor overlap.",
          risk_level: 0.22,
          is_current_region: true,
          known_local_locations: ["square"],
          stock_signals: { bread: 10, fish: 8, wheat: 18, tool: 2 },
        },
      ],
      regional_routes: [],
    },
    target: null,
    recent_events: [
      { seq: 43, kind: "world", text: "Dry wind keeps the road to Dawn Shrine exposed.", day: 1, tick: 24 },
    ],
    help: ["look", "focus [npc]", "travel-region [region name]"],
  };
}

export function buildRoadState() {
  const state = buildVillageState();
  state.state_version = 8;
  state.latest_event_seq = 51;
  state.world.location_name = "On the road to Dawn Shrine";
  state.player.travel_state = {
    is_traveling: true,
    route_id: "route.greenfall.shrine",
    origin_location_id: "square",
    destination_location_id: "shrine",
    ticks_remaining: 6,
    risk_budget: 0.35,
  };
  state.actions.common = [
    { label: "Look", command: "look", enabled: true, blocked_reason: null },
    { label: "Work", command: "work", enabled: false, blocked_reason: "Unavailable while traveling. You cannot work until you arrive." },
    { label: "Meal", command: "meal", enabled: true, item: "bread", blocked_reason: null },
    { label: "Rest", command: "rest 1", enabled: false, blocked_reason: "Unavailable while traveling. You can rest after you arrive." },
    { label: "Sleep", command: "sleep 3", enabled: false, blocked_reason: "Unavailable while traveling. You can sleep after you arrive." },
    { label: "Next", command: "next 1", enabled: true, blocked_reason: null },
  ];
  state.actions.travel = [];
  state.actions.target = [
    { label: "Inspect", command: "inspect", requires_target: true, enabled: false, blocked_reason: "Unavailable while traveling. You cannot interact with anyone until you arrive." },
    { label: "Talk", command: "talk", requires_target: true, enabled: false, blocked_reason: "Unavailable while traveling. You cannot interact with anyone until you arrive." },
    { label: "Ask Rumor", command: "ask rumor", requires_target: true, enabled: false, blocked_reason: "Unavailable while traveling. You cannot interact with anyone until you arrive." },
  ];
  state.scene.people = [];
  state.scene.route_preview = [];
  state.target = null;
  state.recent_events = [
    { seq: 50, kind: "system", text: "You keep moving toward Dawn Shrine. 6 ticks remain.", day: 1, tick: 24 },
  ];
  return state;
}

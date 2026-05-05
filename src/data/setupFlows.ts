export type SetupStep = { id: string; text: string; safetyGate?: boolean };

export type SetupFlow = {
  id: string;
  title: string;
  preamble: string;
  steps: SetupStep[];
  manualRefs: Array<{ source: string; page?: number; title: string }>;
};

export const SETUP_FLOWS: Record<string, SetupFlow> = {
  first_time_mig: {
    id: "first_time_mig",
    title: "First-time MIG setup",
    preamble:
      "Install gas and polarity for solid MIG before threading wire. Power off when changing terminals.",
    steps: [
      {
        id: "ppe",
        text: "PPE: welding helmet, jacket, gloves, closed shoes; ventilate or use fume control.",
        safetyGate: true,
      },
      {
        id: "polarity",
        text: "Route cables: ground clamp to NEGATIVE, wire feed power to POSITIVE (solid MIG / DCEP).",
        safetyGate: true,
      },
      {
        id: "gas",
        text: "Install regulator, leak-check fittings, set flow per wire/gas chart.",
      },
      {
        id: "wire",
        text: "Load spool, set drive roll groove for wire diameter, thread liner, install correct contact tip.",
      },
      {
        id: "tension",
        text: "Set drive tension; perform wire tension test from the manual / quick start.",
      },
      {
        id: "stickout",
        text: "Set stick-out; verify nozzle and tip are clean before striking arc on scrap.",
      },
    ],
    manualRefs: [
      { source: "quick-start-guide.pdf", page: 1, title: "Wire installation" },
      { source: "quick-start-guide.pdf", page: 2, title: "Cable setup" },
      { source: "owner-manual.pdf", page: 14, title: "MIG polarity" },
    ],
  },
  flux_cored_setup: {
    id: "flux_cored_setup",
    title: "Flux-Cored (self-shielded) setup",
    preamble:
      "Polarity is opposite solid MIG. Do not assume last project's routing is still correct.",
    steps: [
      {
        id: "off",
        text: "Power off and unplug before moving cables between terminals.",
        safetyGate: true,
      },
      {
        id: "polarity",
        text: "Ground clamp to POSITIVE; wire feed power to NEGATIVE.",
        safetyGate: true,
      },
      {
        id: "gas-off",
        text: "Self-shielded wire does not use external gas — cap bottle or switch process accordingly.",
      },
      {
        id: "rolls",
        text: "Match drive rolls and tip to flux-cored wire size; thread and tension.",
      },
      {
        id: "outdoor",
        text: "If outdoors, manage wind; expect more spatter — plan cleanup.",
      },
    ],
    manualRefs: [
      { source: "owner-manual.pdf", page: 13, title: "Flux polarity diagram" },
    ],
  },
  stick_setup: {
    id: "stick_setup",
    title: "Stick (SMAW) setup",
    preamble: "Disconnect wire-feed power path; Stick uses electrode holder + work lead routing.",
    steps: [
      {
        id: "off",
        text: "Power off/unplug before reconfiguring terminals.",
        safetyGate: true,
      },
      {
        id: "cables",
        text: "Ground clamp to NEGATIVE; electrode holder to POSITIVE; wire feed power disconnected.",
        safetyGate: true,
      },
      {
        id: "rod",
        text: "Select rod for material/thickness; dry rods if storage requires it.",
      },
      {
        id: "technique",
        text: "Practice arc strikes on scrap; manage arc length and travel.",
      },
    ],
    manualRefs: [{ source: "owner-manual.pdf", page: 14, title: "Cable routing" }],
  },
  tig_setup: {
    id: "tig_setup",
    title: "TIG setup",
    preamble:
      "TIG needs argon, correct torch routing, and wire-feed power disconnected unless manual specifies otherwise.",
    steps: [
      {
        id: "off",
        text: "Power off/unplug for cable changes.",
        safetyGate: true,
      },
      {
        id: "cables",
        text: "Ground clamp to POSITIVE; TIG torch to NEGATIVE; gas to regulator; foot pedal inside unit if used.",
        safetyGate: true,
      },
      {
        id: "wire-feed-off",
        text: "Disconnect wire feed power cable from feeder circuit per TIG routing.",
      },
      {
        id: "gas-tungsten",
        text: "Install correct tungsten type/size; set postflow and start mode per torch.",
      },
    ],
    manualRefs: [{ source: "owner-manual.pdf", page: 14, title: "TIG routing" }],
  },
  wire_spool_loading: {
    id: "wire_spool_loading",
    title: "Load the wire spool",
    preamble: "Mind spring tension on new spools — gloves and eye protection.",
    steps: [
      {
        id: "off",
        text: "Stop machine; relieve wire tension safely.",
        safetyGate: true,
      },
      {
        id: "mount",
        text: "Mount spool so unwind direction matches drive; secure hub/brake per manual.",
      },
      {
        id: "thread",
        text: "Thread into drive rolls and liner; close head gently; align inlet.",
      },
    ],
    manualRefs: [
      { source: "quick-start-guide.pdf", page: 1, title: "Wire setup illustration" },
    ],
  },
  feed_roller_setup: {
    id: "feed_roller_setup",
    title: "Drive roll & groove selection",
    preamble: "Wrong groove size is a top cause of feed issues.",
    steps: [
      {
        id: "match",
        text: "Match groove to wire diameter; U-groove for flux-cored, V-groove for solid (per manual guidance).",
      },
      {
        id: "inspect",
        text: "Inspect rolls for wear; clean debris.",
      },
    ],
    manualRefs: [{ source: "owner-manual.pdf", page: 9, title: "Interior controls" }],
  },
  contact_tip_nozzle: {
    id: "contact_tip_nozzle",
    title: "Contact tip & nozzle",
    preamble: "Hot consumables — cool before service.",
    steps: [
      {
        id: "cool",
        text: "Allow torch to cool; disconnect if needed.",
        safetyGate: true,
      },
      {
        id: "tip",
        text: "Tip inner diameter matches wire; tighten appropriately (avoid cross-thread).",
      },
      {
        id: "nozzle",
        text: "Clear spatter; replace ceramic if cracked.",
      },
    ],
    manualRefs: [{ source: "quick-start-guide.pdf", page: 2, title: "Cable & gun basics" }],
  },
  tension_test: {
    id: "tension_test",
    title: "Wire tension test",
    preamble: "Goal: enough pressure to feed, not enough to deform wire.",
    steps: [
      {
        id: "prep",
        text: "Point gun safely; remove tip if manual test requires; follow quick-start sequence.",
        safetyGate: true,
      },
      {
        id: "adjust",
        text: "Increment pressure; observe smooth feed vs slipping.",
      },
      {
        id: "verify",
        text: "Run scrap bead; watch for slipping or nesting.",
      },
    ],
    manualRefs: [{ source: "quick-start-guide.pdf", page: 1, title: "Wire installation" }],
  },
};

export function getSetupFlow(id: string): SetupFlow | undefined {
  return SETUP_FLOWS[id];
}

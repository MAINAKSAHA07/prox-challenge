import type { TroubleshootingStep } from "@/types/weldpilot";

export type TroubleshootingSymptom = {
  id: string;
  label: string;
  safetyPreamble: string;
  steps: TroubleshootingStep[];
  clarifyingQuestions?: string[];
};

export const TROUBLESHOOTING_SYMPTOMS: Record<string, TroubleshootingSymptom> = {
  porosity: {
    id: "porosity",
    label: "Porosity (pinholes / worm tracks)",
    safetyPreamble:
      "Stop welding if something feels unsafe. For maintenance inside the machine: power off, unplug, and allow components to cool.",
    clarifyingQuestions: [
      "Are you running self-shielded flux-cored, gas-shielded flux-cored, or solid MIG?",
      "Indoors or outdoors? Any strong breeze or fans?",
    ],
    steps: [
      {
        id: "clean-base-metal",
        title: "Base metal cleanliness & fit-up",
        priority: "first",
        checks: [
          "Remove mill scale, oil, paint, rust, and moisture from the joint.",
          "Dry the area — condensation on cold steel causes porosity.",
        ],
        causes: ["Contamination trapped in the puddle."],
        fixes: ["Grind/brake clean to bright metal; wipe with appropriate cleaner; preheat if damp."],
        manualRef: { source: "owner-manual.pdf", page: 42 },
      },
      {
        id: "polarity-wire-type",
        title: "Polarity matches the process",
        priority: "first",
        checks: [
          "Self-shielded flux-cored: ground on POSITIVE, wire feed power on NEGATIVE (per manual polarity diagram).",
          "Solid MIG: opposite polarity — verify you did not leave flux-cored routing on a solid-wire job (or vice versa).",
        ],
        causes: ["Wrong polarity for the wire/process produces an unstable, gassy arc."],
        fixes: ["Re-route cables per process; re-run a short test bead on scrap."],
        manualRef: { source: "owner-manual.pdf", page: 13 },
      },
      {
        id: "gas-mig-only",
        title: "Shielding gas (gas-shielded processes only)",
        priority: "next",
        checks: [
          "If using solid MIG or gas-shielded flux: cylinder on, regulator set, no leaks, adequate flow.",
          "Nozzle not packed with spatter; sufficient stick-out.",
        ],
        causes: ["Insufficient coverage from gas — but this is not the first suspect for self-shielded flux."],
        fixes: ["Fix leaks, increase flow modestly, reduce drafts, clean nozzle."],
      },
      {
        id: "wire-condition",
        title: "Wire condition & storage",
        priority: "next",
        checks: [
          "Wire not rusty or damp — especially flux-cored.",
          "Drive rolls match wire size; liner not choked with debris.",
        ],
        causes: ["Moisture or bad wire adds hydrogen / porosity."],
        fixes: ["Replace suspect wire; store spools dry; check drive system."],
      },
      {
        id: "arc-mechanics",
        title: "Arc length, angle, and travel",
        priority: "later",
        checks: [
          "Avoid excessive voltage for the joint (long arc sounds hissy and turbulent).",
          "Watch for wind blowing shielding away (MIG/TIG) or disturbing flux-cored shielding outdoors.",
        ],
        causes: ["Technique pulls air into the puddle or starves shielding."],
        fixes: ["Shorten arc, adjust work angle, add wind breaks."],
      },
    ],
  },
  wire_feed_motor_runs_no_wire: {
    id: "wire_feed_motor_runs_no_wire",
    label: "Wire feed motor runs but wire does not feed properly",
    safetyPreamble:
      "Power off and unplug before opening the feeder or changing drive rolls. Wear eye protection — wire ends can snap.",
    steps: [
      {
        id: "tension",
        title: "Drive roll pressure (tension)",
        priority: "first",
        checks: [
          "Pressure too light: motor spins but wire slips.",
          "Pressure too heavy: can deform wire and jam in the liner.",
        ],
        fixes: ["Adjust per manual guidance; do a tension test after changes."],
        manualRef: { source: "quick-start-guide.pdf", page: 1 },
      },
      {
        id: "roll-match",
        title: "Drive roll size & groove",
        priority: "first",
        checks: [
          "Roll groove matches wire diameter (common failure mode after switching wire sizes).",
          "Rolls not worn smooth.",
        ],
        fixes: ["Install correct drive rolls; inspect for wear."],
      },
      {
        id: "gun-liner",
        title: "MIG gun, liner, and contact tip",
        priority: "next",
        checks: [
          "Tip sized for wire; tip not clogged with spatter.",
          "Liner not kinked; cable not coiled too tight.",
          "Wire not bird-nesting at the rolls (see bird nesting flow).",
        ],
        fixes: ["Replace tip; clear liner; straighten cable routing."],
        manualRef: { source: "owner-manual.pdf", page: 9 },
      },
    ],
  },
  bird_nesting: {
    id: "bird_nesting",
    label: "Bird nesting (wire bundles at drive rolls)",
    safetyPreamble: "Stop immediately — continuing can damage liner and motor. Power off before clearing.",
    steps: [
      {
        id: "clear-feed",
        title: "Clear the tangle & inspect entry",
        priority: "first",
        checks: ["Wire path aligned into rolls; no sharp bends at inlet."],
        fixes: ["Trim deformed wire; re-thread carefully."],
      },
      {
        id: "tension-gun",
        title: "Tension vs gun issues",
        priority: "next",
        checks: [
          "Excessive drive pressure can mash wire; too little slips then nests.",
          "Gun liner / tip blockage causes back-pressure nesting.",
        ],
        fixes: ["Balance tension; clear tip/liner."],
      },
    ],
  },
  wire_stops_during_weld: {
    id: "wire_stops_during_weld",
    label: "Wire stops feeding during welding",
    safetyPreamble:
      "Thermal or overload protection may trip at high duty cycle — allow cool-down per duty cycle guidance.",
    steps: [
      {
        id: "duty-tip",
        title: "Duty cycle & tip condition",
        priority: "first",
        checks: [
          "Are you near the manual's rated limits for your input voltage and process?",
          "Contact tip opening worn oversized or clogged?",
        ],
        fixes: ["Reduce output or lengthen rest; replace tip."],
        manualRef: { source: "owner-manual.pdf", page: 7 },
      },
      {
        id: "drive",
        title: "Drive system",
        priority: "next",
        checks: ["Drive rolls slipping; liner obstruction; kinked whip."],
        fixes: ["Adjust tension; clear/replace liner segments as needed."],
      },
    ],
  },
  unstable_arc: {
    id: "unstable_arc",
    label: "Unstable / popping arc",
    safetyPreamble: "Check polarity and connections before chasing synergic settings.",
    steps: [
      {
        id: "polarity-conn",
        title: "Polarity & work clamp",
        priority: "first",
        checks: [
          "Correct socket routing for the active process.",
          "Work clamp on clean metal, close to the joint.",
        ],
        fixes: ["Re-seat cables; grind clamp location to bare metal."],
        manualRef: { source: "owner-manual.pdf", page: 14 },
      },
      {
        id: "wire-gas",
        title: "Wire & shielding",
        priority: "next",
        checks: ["Gas flow steady (if used); wire dry; tip clean."],
        fixes: ["Service consumables; reduce drafts."],
      },
    ],
  },
  weak_arc: {
    id: "weak_arc",
    label: "Weak arc / hard to start",
    safetyPreamble: "Confirm input voltage selector and available supply capacity.",
    steps: [
      {
        id: "input-process",
        title: "Input voltage & process mode",
        priority: "first",
        checks: [
          "Machine set for the outlet you are actually using (120 vs 240).",
          "Correct process selected on the panel.",
        ],
        fixes: ["Align machine settings with supply; extension cords adequate gauge/length."],
      },
      {
        id: "connections",
        title: "Cable integrity",
        priority: "next",
        checks: ["Torch and work connections tight; no overheated plugs."],
        fixes: ["Reseat and inspect consumables."],
      },
    ],
  },
  excessive_spatter: {
    id: "excessive_spatter",
    label: "Excessive spatter",
    safetyPreamble: "Spatter is often settings + technique; still wear eye protection and ventilate.",
    steps: [
      {
        id: "voltage-wire",
        title: "Voltage / wire speed balance",
        priority: "first",
        checks: [
          "Too much wire speed for voltage causes stubbing; too little causes long arc spatter.",
        ],
        fixes: ["Adjust one variable at a time on scrap; use synergic baseline then fine tune."],
      },
      {
        id: "stickout-tip",
        title: "Stick-out & tip",
        priority: "next",
        checks: ["Consistent stick-out; tip not fouled."],
        fixes: ["Clean/replace tip; stabilize gun angle."],
      },
    ],
  },
  poor_penetration: {
    id: "poor_penetration",
    label: "Poor penetration / cold lap",
    safetyPreamble: "Do not just crank heat without checking material thickness and joint type.",
    steps: [
      {
        id: "heat-travel",
        title: "Heat input & travel speed",
        priority: "first",
        checks: ["Travel too fast for the heat setting; insufficient prep on thick sections."],
        fixes: ["Slow down; adjust voltage/wire; consider joint prep / multiple passes."],
      },
      {
        id: "polarity-process",
        title: "Process suitability",
        priority: "next",
        checks: ["Thick steel may favor Stick or higher-capacity settings vs thin-sheet MIG."],
        fixes: ["Match process to thickness; respect duty cycle."],
      },
    ],
  },
  burn_through: {
    id: "burn_through",
    label: "Burn-through on thin material",
    safetyPreamble: "Reduce heat and increase travel speed; watch for glowing edges.",
    steps: [
      {
        id: "reduce-heat",
        title: "Lower heat & faster travel",
        priority: "first",
        checks: ["Voltage and wire speed too high for sheet thickness."],
        fixes: ["Use thinner wire if available; stitch welds; back with copper/chill bar if appropriate."],
      },
      {
        id: "fit-up",
        title: "Gap and fit-up",
        priority: "next",
        checks: ["Excessive gap concentrates heat."],
        fixes: ["Tack and close gap; fix fixture."],
      },
    ],
  },
};

export function getTroubleshootingFlow(symptomId: string): TroubleshootingSymptom | undefined {
  return TROUBLESHOOTING_SYMPTOMS[symptomId];
}

export function findSymptomByKeyword(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/(porous|porosity|pinhole|worm)/i.test(t)) return "porosity";
  if (/(bird.?nest|birdnest)/i.test(t)) return "bird_nesting";
  if (/(motor runs|not feed|won't feed|does not feed)/i.test(t) && /wire/i.test(t))
    return "wire_feed_motor_runs_no_wire";
  if (/(stop.*feed|feeding.*stop|stops during)/i.test(t)) return "wire_stops_during_weld";
  if (/(unstable|popping|stutter).*arc/i.test(t)) return "unstable_arc";
  if (/(weak arc|hard to start)/i.test(t)) return "weak_arc";
  if (/spatter/i.test(t)) return "excessive_spatter";
  if (/(penetration|cold lap)/i.test(t)) return "poor_penetration";
  if (/(burn.?through|blow.?out)/i.test(t)) return "burn_through";
  return undefined;
}

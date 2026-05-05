export type ProcessKey = "MIG" | "Flux-Cored" | "Stick" | "TIG";

export type ProcessCapability = {
  key: ProcessKey;
  gasRequired: boolean;
  outdoorWind: "excellent" | "good" | "fair" | "poor";
  cleanliness: "highest" | "high" | "moderate" | "lower";
  skill: "beginner-friendly" | "intermediate" | "advanced";
  materials: string;
  notes: string[];
};

export const PROCESS_CAPABILITIES: Record<ProcessKey, ProcessCapability> = {
  MIG: {
    key: "MIG",
    gasRequired: true,
    outdoorWind: "poor",
    cleanliness: "high",
    skill: "beginner-friendly",
    materials:
      "Mild steel, stainless; aluminum with appropriate spool gun / settings (per manual).",
    notes: [
      "Shielding gas protects the puddle — wind blows it away.",
      "Generally the cleanest arc among wire processes.",
    ],
  },
  "Flux-Cored": {
    key: "Flux-Cored",
    gasRequired: false,
    outdoorWind: "good",
    cleanliness: "moderate",
    skill: "beginner-friendly",
    materials: "Mild steel common; some stainless flux-cored wires exist.",
    notes: [
      "Self-shielded wire uses flux, not an external gas bottle.",
      "Expect more spatter and post-weld cleanup than MIG.",
    ],
  },
  Stick: {
    key: "Stick",
    gasRequired: false,
    outdoorWind: "excellent",
    cleanliness: "lower",
    skill: "intermediate",
    materials:
      "Mild steel, stainless, cast repair — versatile for thicker sections and field work.",
    notes: [
      "No gas cylinder to manage.",
      "Technique-sensitive: arc length, angle, travel speed matter a lot.",
    ],
  },
  TIG: {
    key: "TIG",
    gasRequired: true,
    outdoorWind: "fair",
    cleanliness: "highest",
    skill: "advanced",
    materials: "Mild steel, stainless, chrome-moly — very controllable on thin stock.",
    notes: [
      "Argon shielding required.",
      "Best aesthetics and control, steepest learning curve.",
    ],
  },
};

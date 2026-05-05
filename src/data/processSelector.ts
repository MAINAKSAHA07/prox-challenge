import type { ProcessRecommendation } from "@/types/weldpilot";
import type { ProcessKey } from "./processCapabilities";

export type ProcessSelectorInput = {
  skillLevel?: "beginner" | "intermediate" | "advanced";
  material?: string;
  thicknessInches?: number;
  indoorOutdoor?: "indoor" | "outdoor";
  gasAvailable?: boolean;
  cleanlinessPriority?: "low" | "medium" | "high";
  application?: "hobby" | "repair" | "fabrication" | "thin_sheet";
};

function mentionsAluminum(material?: string) {
  if (!material) return false;
  return /aluminum|aluminium/i.test(material);
}

function thicknessNumber(t?: number) {
  if (t === undefined || Number.isNaN(t)) return undefined;
  return t;
}

export function recommendWeldingProcess(
  input: ProcessSelectorInput,
): ProcessRecommendation {
  const thick = thicknessNumber(input.thicknessInches);
  const outdoor = input.indoorOutdoor === "outdoor";
  const gas = input.gasAvailable !== false;
  const al = mentionsAluminum(input.material);

  if (al && gas) {
    return {
      primary: "MIG",
      alternates: ["TIG"],
      rationale:
        "Aluminum on this class of machine is typically done with a spool gun and argon (MIG), or TIG for maximum control — both need shielding gas.",
      tradeoffs: [
        "MIG with spool gun is faster once dialed in.",
        "TIG is slower but gives the cleanest aluminum stacks.",
      ],
      setupNotes: [
        "Confirm spool gun compatibility and drive roll / liner setup per manual.",
        "Use argon; polarity and wire type must match aluminum procedure.",
      ],
      avoid: [
        "Self-shielded flux-cored is not an aluminum solution.",
        "Stick on aluminum is specialized — not the default path for new owners.",
      ],
    };
  }

  if (outdoor && !gas) {
    const preferStick =
      input.skillLevel === "intermediate" ||
      input.skillLevel === "advanced" ||
      (thick !== undefined && thick >= 0.1875);

    const primary: ProcessKey = preferStick ? "Stick" : "Flux-Cored";
    const alt: ProcessKey = preferStick ? "Flux-Cored" : "Stick";

    return {
      primary,
      alternates: [alt],
      rationale:
        "Outside without a gas bottle, you want a process that does not rely on external shielding gas. Flux-Cored (self-shielded) and Stick both tolerate breeze better than MIG with solid wire.",
      tradeoffs: [
        "Flux-Cored is often easier to pick up than Stick for thinner hobby work.",
        "Stick shines on thicker steel and rougher repairs but needs cleaner technique.",
      ],
      setupNotes: [
        "For Flux-Cored self-shielded, polarity is opposite of solid MIG — verify terminals.",
        "For Stick, disconnect wire-feed power and route cables per Stick polarity.",
      ],
      avoid: [
        "Solid-wire MIG without shielding gas — the arc will not be properly protected.",
      ],
    };
  }

  if (!gas && !outdoor) {
    return {
      primary: "Flux-Cored",
      alternates: ["Stick"],
      rationale:
        "Without shielding gas, solid MIG is off the table. Self-shielded Flux-Cored is the usual garage default; Stick is great if you want maximum simplicity and thicker steel capability.",
      tradeoffs: [
        "Flux-Cored: faster for sheet and light fabrication once polarity is correct.",
        "Stick: fewer consumable complexities, more technique practice.",
      ],
      setupNotes: [
        "Check flux-cored polarity (ground positive, wire feed negative for self-shielded).",
      ],
      avoid: ["MIG solid wire without gas.", "TIG without argon."],
    };
  }

  if (thick !== undefined && thick <= 0.125 && gas) {
    const wantClean = input.cleanlinessPriority === "high";
    if (wantClean && input.skillLevel === "advanced") {
      return {
        primary: "TIG",
        alternates: ["MIG"],
        rationale:
          "Thin material with high cleanliness goals points to TIG if you have gas and the patience to learn.",
        tradeoffs: [
          "TIG: best control, slowest.",
          "MIG: much faster on thin steel with great results when tuned.",
        ],
        setupNotes: [
          "TIG needs clean tungsten, correct gas flow, and good fit-up.",
        ],
        avoid: ["Heavy Stick on very thin sheet — burn-through risk."],
      };
    }
    return {
      primary: "MIG",
      alternates: ["TIG", "Flux-Cored"],
      rationale:
        "With gas available and thin mild steel, MIG is usually the fastest path to clean, controlled welds.",
      tradeoffs: [
        "Outdoor breeze still matters for MIG — add wind breaks or consider flux-cored/stick outside.",
      ],
      setupNotes: [
        "Use appropriate shielding gas for wire type (common: C25 for mild steel).",
      ],
      avoid: [
        "Running too hot on 120V input without respecting duty cycle — let the machine cool.",
      ],
    };
  }

  if (gas) {
    return {
      primary: "MIG",
      alternates: ["TIG", "Stick"],
      rationale:
        "General-purpose garage work with gas available: MIG is the default multiprocess starting point on the OmniPro 220.",
      tradeoffs: [
        "Stick trades convenience for portability in windy conditions.",
        "TIG trades speed for control.",
      ],
      setupNotes: [
        "Match polarity to process (MIG vs Flux vs Stick vs TIG) before striking an arc.",
      ],
      avoid: ["Mixing up flux-cored polarity with solid MIG polarity."],
    };
  }

  return {
    primary: "Flux-Cored",
    alternates: ["Stick", "MIG"],
    rationale:
      "Defaulting to Flux-Cored when gas availability is unclear — it is the common no-bottle wire process on this machine.",
    tradeoffs: ["More spatter than MIG.", "Better outdoor tolerance than gas MIG."],
    setupNotes: ["Confirm self-shielded vs gas-shielded wire type on the label."],
    avoid: [],
  };
}

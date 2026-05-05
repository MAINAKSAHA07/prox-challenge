import type { InputVoltage, WeldProcess } from "@/types/weldpilot";

export type DutyAnchor = {
  dutyCyclePercent: number;
  amperage: number;
};

export type DutyCycleTable = Record<
  WeldProcess,
  Record<InputVoltage, DutyAnchor[]>
>;

/** Exact rated points from the OmniPro 220 owner manual duty cycle specifications. */
export const DUTY_CYCLE_TABLE: DutyCycleTable = {
  MIG: {
    "120": [
      { dutyCyclePercent: 40, amperage: 100 },
      { dutyCyclePercent: 100, amperage: 75 },
    ],
    "240": [
      { dutyCyclePercent: 25, amperage: 200 },
      { dutyCyclePercent: 100, amperage: 115 },
    ],
  },
  TIG: {
    "120": [
      { dutyCyclePercent: 40, amperage: 125 },
      { dutyCyclePercent: 100, amperage: 90 },
    ],
    "240": [
      { dutyCyclePercent: 30, amperage: 175 },
      { dutyCyclePercent: 100, amperage: 105 },
    ],
  },
  Stick: {
    "120": [
      { dutyCyclePercent: 40, amperage: 80 },
      { dutyCyclePercent: 100, amperage: 60 },
    ],
    "240": [
      { dutyCyclePercent: 25, amperage: 175 },
      { dutyCyclePercent: 100, amperage: 100 },
    ],
  },
};

export const DUTY_SOURCE_NOTE =
  "Owner's Manual — rated duty cycle specifications (10-minute cycle).";

export type DutyLookupResult = {
  exact: boolean;
  dutyCyclePercent: number | null;
  weldMinutesPer10: number | null;
  restMinutesPer10: number | null;
  interpolationNote?: string;
  caution?: string;
  anchors: DutyAnchor[];
};

function minutesFromDuty(percent: number): { weld: number; rest: number } {
  const weld = (percent / 100) * 10;
  const rest = 10 - weld;
  return { weld: Math.round(weld * 10) / 10, rest: Math.round(rest * 10) / 10 };
}

export function lookupDutyCycle(
  process: WeldProcess,
  voltage: InputVoltage,
  amperage: number,
): DutyLookupResult {
  const anchors = [...DUTY_CYCLE_TABLE[process][voltage]].sort(
    (a, b) => a.amperage - b.amperage,
  );

  const exact = anchors.find((a) => a.amperage === amperage);
  if (exact) {
    const { weld, rest } = minutesFromDuty(exact.dutyCyclePercent);
    return {
      exact: true,
      dutyCyclePercent: exact.dutyCyclePercent,
      weldMinutesPer10: weld,
      restMinutesPer10: rest,
      anchors,
    };
  }

  const maxAmp = Math.max(...anchors.map((a) => a.amperage));

  let caution: string | undefined;
  if (amperage > maxAmp) {
    caution =
      "You're above the highest rated anchor in the manual for this process and input voltage. The manual does not specify duty cycle at this exact output — treat the machine gently, watch for thermal warnings, and prefer the official duty cycle table values.";
  }

  const nearest = anchors.reduce((best, cur) =>
    Math.abs(cur.amperage - amperage) < Math.abs(best.amperage - amperage)
      ? cur
      : best,
  );

  const interpolationNote = `The manual lists rated anchor points only (not a continuous curve). Nearest published rating: ${nearest.dutyCyclePercent}% at ${nearest.amperage}A.`;

  return {
    exact: false,
    dutyCyclePercent: null,
    weldMinutesPer10: null,
    restMinutesPer10: null,
    interpolationNote,
    caution,
    anchors,
  };
}

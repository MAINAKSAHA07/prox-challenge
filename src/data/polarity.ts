import type { ConnectionRole, PolarityProcess } from "@/types/weldpilot";

export type PolaritySetup = {
  process: PolarityProcess;
  label: string;
  connections: Array<{
    role: ConnectionRole;
    socket: "positive" | "negative" | "n/a";
    label: string;
  }>;
  notes: string[];
  manualRef: { source: string; page: number; title: string };
};

export const POLARITY_SETUPS: Record<PolarityProcess, PolaritySetup> = {
  mig_solid: {
    process: "mig_solid",
    label: "MIG (solid-core, gas-shielded)",
    connections: [
      {
        role: "ground_clamp",
        socket: "negative",
        label: "Work cable / ground clamp",
      },
      {
        role: "wire_feed_power",
        socket: "positive",
        label: "Wire feed power cable (to feeder)",
      },
    ],
    notes: [
      "DCEP (electrode positive) for typical short-circuit MIG on steel — current flows from the workpiece into the wire.",
      "Use shielding gas appropriate for your wire and base metal.",
    ],
    manualRef: {
      source: "owner-manual.pdf",
      page: 14,
      title: "MIG polarity / gas setup",
    },
  },
  flux_cored: {
    process: "flux_cored",
    label: "Flux-Cored (self-shielded)",
    connections: [
      {
        role: "ground_clamp",
        socket: "positive",
        label: "Work cable / ground clamp",
      },
      {
        role: "wire_feed_power",
        socket: "negative",
        label: "Wire feed power cable (to feeder)",
      },
    ],
    notes: [
      "DCEN for self-shielded flux-cored — opposite of typical solid MIG polarity.",
      "If you are running gas-shielded flux-cored (dual-shield), polarity and gas differ — confirm your wire classification.",
    ],
    manualRef: {
      source: "owner-manual.pdf",
      page: 13,
      title: "Flux-Cored polarity setup",
    },
  },
  stick: {
    process: "stick",
    label: "Stick (SMAW)",
    connections: [
      {
        role: "ground_clamp",
        socket: "negative",
        label: "Work cable / ground clamp",
      },
      {
        role: "electrode_holder",
        socket: "positive",
        label: "Electrode holder",
      },
      {
        role: "wire_feed_power",
        socket: "n/a",
        label: "Wire feed power cable — disconnected",
      },
    ],
    notes: [
      "Remove or isolate the wire feed power connection when running stick.",
    ],
    manualRef: {
      source: "owner-manual.pdf",
      page: 14,
      title: "Process cable routing",
    },
  },
  tig: {
    process: "tig",
    label: "TIG (GTAW)",
    connections: [
      {
        role: "ground_clamp",
        socket: "positive",
        label: "Work cable / ground clamp",
      },
      {
        role: "tig_torch",
        socket: "negative",
        label: "TIG torch lead",
      },
      {
        role: "gas_line",
        socket: "n/a",
        label: "Shielding gas line to regulator / flowmeter",
      },
      {
        role: "foot_pedal",
        socket: "n/a",
        label: "Foot pedal (if used) — plugs inside welder per manual",
      },
      {
        role: "wire_feed_power",
        socket: "n/a",
        label: "Wire feed power cable — disconnected",
      },
    ],
    notes: [
      "High-frequency starts and TIG accessories vary — follow the manual for your torch kit.",
    ],
    manualRef: {
      source: "owner-manual.pdf",
      page: 14,
      title: "TIG routing overview",
    },
  },
};

export function getPolaritySetup(
  process: PolarityProcess,
): PolaritySetup {
  return POLARITY_SETUPS[process];
}

export type Confidence = "high" | "medium" | "low";

export type ConnectionRole =
  | "ground_clamp"
  | "wire_feed_power"
  | "electrode_holder"
  | "tig_torch"
  | "gas_line"
  | "foot_pedal"
  | "disconnected";

export type PolarityProcess =
  | "mig_solid"
  | "flux_cored"
  | "stick"
  | "tig";

export type WeldProcess = "MIG" | "TIG" | "Stick";

export type InputVoltage = "120" | "240";

export type ResponseBlock =
  | {
      type: "text_answer";
      content: string;
    }
  | {
      type: "safety_warning";
      severity: "info" | "warning" | "critical";
      content: string;
    }
  | {
      type: "manual_reference";
      title: string;
      source: string;
      page?: number;
      note?: string;
    }
  | {
      type: "image_reference";
      topic: string;
      imagePath: string;
      title: string;
      page?: number;
      caption?: string;
    }
  | {
      type: "polarity_diagram";
      process: PolarityProcess;
      connections: Array<{
        role: ConnectionRole;
        socket: "positive" | "negative" | "n/a";
        label: string;
      }>;
      notes?: string[];
    }
  | {
      type: "duty_cycle_calculator";
      process: WeldProcess;
      voltage: InputVoltage;
      amperage: number;
    }
  | {
      type: "duty_cycle_result";
      process: WeldProcess;
      voltage: InputVoltage;
      amperage: number;
      dutyCyclePercent: number | null;
      weldMinutesPer10: number | null;
      restMinutesPer10: number | null;
      interpolationNote?: string;
      sourceNote: string;
      caution?: string;
    }
  | {
      type: "troubleshooting_flowchart";
      symptomId: string;
      symptomLabel: string;
      steps: TroubleshootingStep[];
    }
  | {
      type: "process_selector";
      recommendation: ProcessRecommendation;
    }
  | {
      type: "setup_checklist";
      flowId: string;
      title: string;
      steps: Array<{ id: string; text: string; safetyGate?: boolean }>;
    }
  | {
      type: "settings_card";
      title: string;
      rows: Array<{ label: string; value: string }>;
    }
  | {
      type: "comparison_table";
      title: string;
      columns: string[];
      rows: string[][];
    };

export type TroubleshootingStep = {
  id: string;
  title: string;
  checks: string[];
  causes?: string[];
  fixes?: string[];
  priority: "first" | "next" | "later";
  manualRef?: { source: string; page?: number };
};

export type ProcessRecommendation = {
  primary: "MIG" | "Flux-Cored" | "Stick" | "TIG";
  alternates: Array<"MIG" | "Flux-Cored" | "Stick" | "TIG">;
  rationale: string;
  tradeoffs: string[];
  setupNotes: string[];
  avoid: string[];
};

export type WeldPilotResponse = {
  answer: string;
  confidence: Confidence;
  needsClarification: boolean;
  clarifyingQuestion: string | null;
  blocks: ResponseBlock[];
};

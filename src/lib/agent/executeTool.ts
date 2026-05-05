import { lookupDutyCycle, DUTY_SOURCE_NOTE } from "@/data/dutyCycles";
import { getPolaritySetup } from "@/data/polarity";
import {
  findSymptomByKeyword,
  getTroubleshootingFlow,
  TROUBLESHOOTING_SYMPTOMS,
} from "@/data/troubleshooting";
import { recommendWeldingProcess } from "@/data/processSelector";
import { getSetupFlow, SETUP_FLOWS } from "@/data/setupFlows";
import { getManualImageByTopic, searchManualImages, MANUAL_IMAGES } from "@/data/manualImages";
import { searchManual } from "@/lib/knowledge/searchManual";
import {
  getFrontPanelLabels,
  getInteriorControlLabels,
} from "@/data/panelLabels";
import type {
  InputVoltage,
  PolarityProcess,
  ProcessRecommendation,
  TroubleshootingStep,
  WeldProcess,
  WeldPilotResponse,
} from "@/types/weldpilot";

export type ToolName =
  | "lookupDutyCycle"
  | "getPolaritySetup"
  | "getTroubleshootingFlow"
  | "recommendWeldingProcess"
  | "getSetupFlow"
  | "getManualImage"
  | "searchManual"
  | "getFrontPanelLabels"
  | "getInteriorControlLabels";

export const WELDPILOT_TOOLS = [
  {
    name: "lookupDutyCycle" as const,
    description:
      "Exact duty cycle lookup for MIG, TIG, or Stick at 120V or 240V. Uses only manual anchor points.",
    input_schema: {
      type: "object",
      properties: {
        process: { type: "string", enum: ["MIG", "TIG", "Stick"] },
        voltage: { type: "string", enum: ["120", "240"] },
        amperage: { type: "number" },
      },
      required: ["process", "voltage", "amperage"],
    },
  },
  {
    name: "getPolaritySetup" as const,
    description:
      "Return structured polarity / cable routing for mig_solid, flux_cored, stick, or tig.",
    input_schema: {
      type: "object",
      properties: {
        process: {
          type: "string",
          enum: ["mig_solid", "flux_cored", "stick", "tig"],
        },
      },
      required: ["process"],
    },
  },
  {
    name: "getTroubleshootingFlow" as const,
    description:
      "Structured troubleshooting for a symptom id (porosity, wire_feed_motor_runs_no_wire, ...). Pass userText to auto-detect symptom when symptomId unknown.",
    input_schema: {
      type: "object",
      properties: {
        symptomId: { type: "string" },
        userText: { type: "string" },
      },
    },
  },
  {
    name: "recommendWeldingProcess" as const,
    description: "Recommend MIG / Flux-Cored / Stick / TIG from constraints.",
    input_schema: {
      type: "object",
      properties: {
        skillLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
        material: { type: "string" },
        thicknessInches: { type: "number" },
        indoorOutdoor: { type: "string", enum: ["indoor", "outdoor"] },
        gasAvailable: { type: "boolean" },
        cleanlinessPriority: { type: "string", enum: ["low", "medium", "high"] },
        application: {
          type: "string",
          enum: ["hobby", "repair", "fabrication", "thin_sheet"],
        },
      },
    },
  },
  {
    name: "getSetupFlow" as const,
    description: "Return a checklist setup flow by id (e.g. first_time_mig, flux_cored_setup).",
    input_schema: {
      type: "object",
      properties: { flowId: { type: "string" } },
      required: ["flowId"],
    },
  },
  {
    name: "getManualImage" as const,
    description: "Fetch manual image registry entry by topic or id.",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string" } },
      required: ["topic"],
    },
  },
  {
    name: "searchManual" as const,
    description: "Keyword search across extracted manual text chunks.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "getFrontPanelLabels" as const,
    description: "Labels for front panel controls.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "getInteriorControlLabels" as const,
    description: "Labels for interior wire feed controls.",
    input_schema: { type: "object", properties: {} },
  },
];

export function executeTool(
  name: ToolName,
  input: Record<string, unknown>,
): unknown {
  switch (name) {
    case "lookupDutyCycle": {
      const process = input.process as WeldProcess;
      const voltage = input.voltage as InputVoltage;
      const amperage = Number(input.amperage);
      const r = lookupDutyCycle(process, voltage, amperage);
      return {
        exact: r.exact,
        dutyCyclePercent: r.dutyCyclePercent,
        weldMinutesPer10: r.weldMinutesPer10,
        restMinutesPer10: r.restMinutesPer10,
        interpolationNote: r.interpolationNote,
        caution: r.caution,
        anchors: r.anchors,
        sourceNote: DUTY_SOURCE_NOTE,
      };
    }
    case "getPolaritySetup": {
      return getPolaritySetup(input.process as PolarityProcess);
    }
    case "getTroubleshootingFlow": {
      const userText = String(input.userText || "");
      const fromText = userText ? findSymptomByKeyword(userText) : undefined;
      const id = String(input.symptomId || "") || fromText || "";
      const flow =
        (id && (getTroubleshootingFlow(id) ?? TROUBLESHOOTING_SYMPTOMS[id])) ||
        undefined;
      return (
        flow ?? {
          error: "unknown_symptom",
          known: Object.keys(TROUBLESHOOTING_SYMPTOMS),
        }
      );
    }
    case "recommendWeldingProcess": {
      return recommendWeldingProcess({
        skillLevel: input.skillLevel as never,
        material: input.material as string,
        thicknessInches: input.thicknessInches as number,
        indoorOutdoor: input.indoorOutdoor as never,
        gasAvailable: input.gasAvailable as boolean,
        cleanlinessPriority: input.cleanlinessPriority as never,
        application: input.application as never,
      });
    }
    case "getSetupFlow": {
      return getSetupFlow(String(input.flowId)) ?? {
        error: "unknown_flow",
        known: Object.keys(SETUP_FLOWS),
      };
    }
    case "getManualImage": {
      const topic = String(input.topic);
      return (
        getManualImageByTopic(topic) ??
        searchManualImages(topic)[0] ?? {
          error: "not_found",
          topics: MANUAL_IMAGES.map((m) => m.topic),
        }
      );
    }
    case "searchManual": {
      return searchManual(String(input.query), 6);
    }
    case "getFrontPanelLabels":
      return getFrontPanelLabels();
    case "getInteriorControlLabels":
      return getInteriorControlLabels();
    default:
      return { error: "unknown_tool", name };
  }
}

const SYSTEM_PROMPT = `You are WeldPilot, a multimodal technical support agent for the Vulcan OmniPro 220 multiprocess welder.

You MUST call tools for factual lookups before answering. Never invent exact duty cycles, polarities, or page numbers.

When responding to the user, your FINAL assistant message must be a single JSON object (no markdown fences) matching this TypeScript shape:
{
  "answer": string,
  "confidence": "high" | "medium" | "low",
  "needsClarification": boolean,
  "clarifyingQuestion": string | null,
  "blocks": ResponseBlock[]
}

ResponseBlock variants:
- { "type": "text_answer", "content": string }
- { "type": "safety_warning", "severity": "info"|"warning"|"critical", "content": string }
- { "type": "manual_reference", "title": string, "source": string, "page"?: number, "note"?: string }
- { "type": "image_reference", "topic": string, "imagePath": string, "title": string, "page"?: number, "caption"?: string }
- { "type": "polarity_diagram", "process": "mig_solid"|"flux_cored"|"stick"|"tig", "connections": [...], "notes"?: string[] }
- { "type": "duty_cycle_result", "process": "MIG"|"TIG"|"Stick", "voltage": "120"|"240", "amperage": number, "dutyCyclePercent": number|null, "weldMinutesPer10": number|null, "restMinutesPer10": number|null, "interpolationNote"?: string, "sourceNote": string, "caution"?: string }
- { "type": "duty_cycle_calculator", "process": "MIG"|"TIG"|"Stick", "voltage": "120"|"240", "amperage": number }  // only if you need UI to compute — prefer duty_cycle_result when tool gives numbers
- { "type": "troubleshooting_flowchart", "symptomId": string, "symptomLabel": string, "steps": TroubleshootingStep[] }
- { "type": "process_selector", "recommendation": ProcessRecommendation }
- { "type": "setup_checklist", "flowId": string, "title": string, "steps": { id, text, safetyGate? }[] }
- { "type": "settings_card", "title": string, "rows": { label, value }[] }
- { "type": "comparison_table", "title": string, "columns": string[], "rows": string[][] }

Rules:
1) For any polarity question, include a polarity_diagram block built from getPolaritySetup tool output.
2) For duty cycle questions, call lookupDutyCycle and include duty_cycle_result with sourceNote from tool output.
3) For troubleshooting, call getTroubleshootingFlow and include troubleshooting_flowchart mirroring tool steps (trim if huge).
4) For process selection, call recommendWeldingProcess and include process_selector.
5) For setup walkthroughs, call getSetupFlow and include setup_checklist plus image_reference when useful.
6) For "front panel" / controls, call getManualImage topic front_panel and getFrontPanelLabels — include image_reference + settings_card.
7) For porosity in flux-cored, do NOT lead with shielding gas unless user is on gas-shielded MIG/flux. Ask clarifyingQuestion if wire type ambiguous.
8) Plain-language, garage tone. Safety warnings for cable changes, maintenance, welding hazards — concise.

After tools return, synthesize answer + blocks. Return ONLY JSON in the final message.`;

export function buildSystemPrompt() {
  return SYSTEM_PROMPT;
}

/** Post-process: enrich response blocks from tool results if model omitted visuals */
export function postProcessResponse(
  parsed: WeldPilotResponse,
  lastToolTrace: Array<{ name: ToolName; result: unknown; input: Record<string, unknown> }>,
): WeldPilotResponse {
  const blocks = [...parsed.blocks];
  const has = (t: string) => blocks.some((b) => b.type === t);

  for (const trace of lastToolTrace) {
    if (trace.name === "getPolaritySetup" && trace.result && typeof trace.result === "object" && !has("polarity_diagram")) {
      const p = trace.result as { process: PolarityProcess; connections: never; notes: string[] };
      blocks.push({
        type: "polarity_diagram",
        process: p.process,
        connections: p.connections,
        notes: p.notes,
      });
    }
    if (trace.name === "lookupDutyCycle" && trace.result && typeof trace.result === "object" && !has("duty_cycle_result")) {
      const tr = trace.result as Record<string, unknown>;
      const inp = trace.input;
      blocks.push({
        type: "duty_cycle_result",
        process: inp.process as WeldProcess,
        voltage: inp.voltage as InputVoltage,
        amperage: Number(inp.amperage),
        dutyCyclePercent: tr.dutyCyclePercent as number | null,
        weldMinutesPer10: tr.weldMinutesPer10 as number | null,
        restMinutesPer10: tr.restMinutesPer10 as number | null,
        interpolationNote: tr.interpolationNote as string | undefined,
        sourceNote: String(tr.sourceNote ?? DUTY_SOURCE_NOTE),
        caution: tr.caution as string | undefined,
      });
    }
    if (trace.name === "getTroubleshootingFlow" && trace.result && typeof trace.result === "object" && !("error" in (trace.result as object)) && !has("troubleshooting_flowchart")) {
      const f = trace.result as { id: string; label: string; steps: TroubleshootingStep[] };
      blocks.push({
        type: "troubleshooting_flowchart",
        symptomId: f.id,
        symptomLabel: f.label,
        steps: f.steps,
      });
      if (f.id === "wire_feed_motor_runs_no_wire") {
        const im = getManualImageByTopic("interior_controls");
        if (im) {
          blocks.push({
            type: "image_reference",
            topic: im.topic,
            imagePath: im.imagePath,
            title: im.title,
            page: im.page,
            caption: im.caption,
          });
        }
      }
    }
    if (trace.name === "recommendWeldingProcess" && trace.result && typeof trace.result === "object" && !has("process_selector")) {
      blocks.push({
        type: "process_selector",
        recommendation: trace.result as ProcessRecommendation,
      });
    }
    if (trace.name === "getSetupFlow" && trace.result && typeof trace.result === "object" && !("error" in (trace.result as object)) && !has("setup_checklist")) {
      const s = trace.result as { id: string; title: string; steps: { id: string; text: string; safetyGate?: boolean }[] };
      blocks.push({
        type: "setup_checklist",
        flowId: s.id,
        title: s.title,
        steps: s.steps,
      });
    }
    if (trace.name === "getManualImage" && trace.result && typeof trace.result === "object" && !("error" in (trace.result as object)) && !has("image_reference")) {
      const im = trace.result as { topic: string; imagePath: string; title: string; page?: number; caption?: string };
      blocks.push({
        type: "image_reference",
        topic: im.topic,
        imagePath: im.imagePath,
        title: im.title,
        page: im.page,
        caption: im.caption,
      });
    }
  }

  return { ...parsed, blocks };
}

export function safeParseWeldPilotJson(text: string): WeldPilotResponse | null {
  let trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) trimmed = fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as WeldPilotResponse;
  } catch {
    return null;
  }
}

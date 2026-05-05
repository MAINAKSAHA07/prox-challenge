import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  Tool,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import {
  WELDPILOT_TOOLS,
  buildSystemPrompt,
  executeTool,
  postProcessResponse,
  safeParseWeldPilotJson,
  type ToolName,
} from "@/lib/agent/executeTool";
import type { WeldPilotResponse } from "@/types/weldpilot";

const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function runWeldPilotAgent(
  messages: MessageParam[],
): Promise<WeldPilotResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const toolTrace: Array<{
    name: ToolName;
    result: unknown;
    input: Record<string, unknown>;
  }> = [];

  let working = [...messages];
  for (let turn = 0; turn < 12; turn++) {
    const res = await client.messages.create({
      model,
      max_tokens: 8192,
      system: buildSystemPrompt(),
      tools: WELDPILOT_TOOLS.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema,
      })) as Tool[],
      messages: working,
    });

    if (res.stop_reason === "end_turn" || res.stop_reason === "max_tokens") {
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      const parsed = safeParseWeldPilotJson(text);
      if (parsed) {
        return postProcessResponse(parsed, toolTrace);
      }
      return {
        answer: text || "No structured response returned.",
        confidence: "low",
        needsClarification: false,
        clarifyingQuestion: null,
        blocks: [{ type: "text_answer", content: text }],
      };
    }

    if (res.stop_reason !== "tool_use") {
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");
      return {
        answer: text || "Stopped unexpectedly.",
        confidence: "low",
        needsClarification: false,
        clarifyingQuestion: null,
        blocks: [{ type: "text_answer", content: text }],
      };
    }

    const assistantBlocks = res.content;
    working = [
      ...working,
      { role: "assistant", content: assistantBlocks },
    ];

    const toolResults: ToolResultBlockParam[] = [];
    for (const block of assistantBlocks) {
      if (block.type !== "tool_use") continue;
      const name = block.name as ToolName;
      const input = (block.input ?? {}) as Record<string, unknown>;
      const result = executeTool(name, input);
      toolTrace.push({ name, result, input });
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    working = [...working, { role: "user", content: toolResults }];
  }

  return {
    answer: "Agent stopped after too many tool turns. Try a narrower question.",
    confidence: "low",
    needsClarification: true,
    clarifyingQuestion: "Can you restate the process (MIG/Flux/Stick/TIG) and input voltage?",
    blocks: [],
  };
}

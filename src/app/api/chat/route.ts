import { runWeldPilotAgent } from "@/lib/agent/weldpilotAgent";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { NextResponse } from "next/server";

export const maxDuration = 120;

type ChatRequest = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};

export async function POST(req: Request) {
  try {
    let body: ChatRequest;
    try {
      body = (await req.json()) as ChatRequest;
    } catch {
      return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "messages required (non-empty array)" },
        { status: 400 },
      );
    }

    const sanitized = body.messages.filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    );

    if (sanitized.length === 0) {
      return NextResponse.json(
        { error: "each message needs role user|assistant and non-empty content" },
        { status: 400 },
      );
    }

    const mapped: MessageParam[] = sanitized.map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }));

    const result = await runWeldPilotAgent(mapped);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

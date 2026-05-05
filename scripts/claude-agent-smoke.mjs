/**
 * Verifies @anthropic-ai/claude-agent-sdk is installed and can run a read-only query.
 * Not used by the web UI (Next.js uses Messages API + tools for low-latency chat).
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cwd = path.dirname(fileURLToPath(new URL("..", import.meta.url)));

let saw = false;
for await (const message of query({
  prompt:
    "Read the file src/data/dutyCycles.ts. Reply with one line: the duty cycle percent for MIG 240V at 200A according to DUTY_CYCLE_TABLE.",
  options: {
    cwd,
    allowedTools: ["Read", "Glob"],
    permissionMode: "acceptEdits",
  },
})) {
  if ("result" in message) {
    console.log("result:", message.result);
    saw = true;
  }
}

if (!saw) console.log("No result message (check API key and SDK output).");

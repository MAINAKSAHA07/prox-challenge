"use client";

import type { ConnectionRole, PolarityProcess } from "@/types/weldpilot";
import { cn } from "@/lib/utils";

type Conn = {
  role: ConnectionRole;
  socket: "positive" | "negative" | "n/a";
  label: string;
};

const processTitle: Record<PolarityProcess, string> = {
  mig_solid: "MIG (solid / gas-shielded)",
  flux_cored: "Flux-Cored (self-shielded)",
  stick: "Stick (SMAW)",
  tig: "TIG (GTAW)",
};

function Socket({
  polarity,
  label,
  highlight,
}: {
  polarity: "+" | "−";
  label: string;
  highlight: "pos" | "neg" | null;
}) {
  const active =
    (polarity === "+" && highlight === "pos") ||
    (polarity === "−" && highlight === "neg");
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2 min-w-[100px]",
        active
          ? "border-orange-500 bg-orange-950/40"
          : "border-zinc-600 bg-zinc-950",
      )}
    >
      <span className="text-2xl font-bold text-orange-500">{polarity}</span>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
    </div>
  );
}

export function PolarityDiagram({
  process,
  connections,
  notes,
}: {
  process: PolarityProcess;
  connections: Conn[];
  notes?: string[];
}) {
  const pos = connections.filter((c) => c.socket === "positive");
  const neg = connections.filter((c) => c.socket === "negative");
  const na = connections.filter((c) => c.socket === "n/a");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-orange-500/90">
          Polarity diagram
        </p>
        <h4 className="text-base font-semibold text-zinc-100">
          {processTitle[process]}
        </h4>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <Socket polarity="−" label="Negative socket" highlight="neg" />
          <ul className="space-y-1 text-xs text-zinc-400 max-w-[200px]">
            {neg.map((c) => (
              <li key={c.role}>
                <span className="text-orange-400">→</span> {c.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden sm:flex flex-col items-center justify-center text-zinc-600 text-xs pt-8">
          Front panel
        </div>
        <div className="flex flex-col items-center gap-3">
          <Socket polarity="+" label="Positive socket" highlight="pos" />
          <ul className="space-y-1 text-xs text-zinc-400 max-w-[200px]">
            {pos.map((c) => (
              <li key={c.role}>
                <span className="text-orange-400">→</span> {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {na.length > 0 && (
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 p-3">
          <p className="text-xs font-medium text-zinc-500 mb-2">Disconnected / other</p>
          <ul className="space-y-1 text-xs text-zinc-400">
            {na.map((c) => (
              <li key={c.role}>{c.label}</li>
            ))}
          </ul>
        </div>
      )}

      {notes && notes.length > 0 && (
        <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1">
          {notes.map((n) => (
            <li key={n.slice(0, 24)}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

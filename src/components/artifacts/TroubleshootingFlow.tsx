"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import type { TroubleshootingStep } from "@/types/weldpilot";
import { cn } from "@/lib/utils";

export function TroubleshootingFlow({
  symptomLabel,
  steps,
  safetyPreamble,
}: {
  symptomLabel: string;
  steps: TroubleshootingStep[];
  safetyPreamble?: string;
}) {
  const ordered = [...steps].sort((a, b) => {
    const rank = { first: 0, next: 1, later: 2 } as const;
    return rank[a.priority] - rank[b.priority];
  });

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-orange-500/90">
          Troubleshooting
        </p>
        <h4 className="text-base font-semibold">{symptomLabel}</h4>
      </div>
      {safetyPreamble && (
        <p className="text-xs text-amber-100/90 bg-amber-950/40 border border-amber-800/50 rounded-md p-2">
          {safetyPreamble}
        </p>
      )}
      <Accordion.Root type="multiple" className="space-y-2">
        {ordered.map((s) => (
          <Accordion.Item
            key={s.id}
            value={s.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950/50 overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium",
                  "hover:bg-zinc-900/80 data-[state=open]:bg-zinc-900",
                )}
              >
                <span className="flex items-center gap-2">
                  {s.priority === "first" && (
                    <span className="text-[10px] uppercase bg-orange-600/20 text-orange-400 px-1.5 py-0.5 rounded">
                      Check first
                    </span>
                  )}
                  {s.title}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-3 pb-3 text-xs text-zinc-400">
              {s.causes && s.causes.length > 0 && (
                <p className="mb-2">
                  <span className="text-zinc-500">Likely causes:</span>{" "}
                  {s.causes.join(" ")}
                </p>
              )}
              {s.checks.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mb-2">
                  {s.checks.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {s.fixes && s.fixes.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  {s.fixes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
              {s.manualRef && (
                <p className="mt-2 text-[11px] text-zinc-600">
                  Manual: {s.manualRef.source}
                  {s.manualRef.page ? ` p.${s.manualRef.page}` : ""}
                </p>
              )}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

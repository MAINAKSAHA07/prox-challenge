"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SetupChecklist({
  title,
  steps,
}: {
  title: string;
  steps: Array<{ id: string; text: string; safetyGate?: boolean }>;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold">{title}</h4>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() =>
                setDone((d) => ({ ...d, [s.id]: !d[s.id] }))
              }
              className={cn(
                "flex w-full text-left gap-2 rounded-lg border p-2 text-xs transition-colors",
                s.safetyGate
                  ? "border-amber-800/60 bg-amber-950/20"
                  : "border-zinc-800 bg-zinc-950/40",
                done[s.id] && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                  done[s.id]
                    ? "border-orange-500 bg-orange-600 text-white"
                    : "border-zinc-600",
                )}
              >
                {done[s.id] ? <Check className="h-3 w-3" /> : null}
              </span>
              <span className={cn(done[s.id] && "line-through text-zinc-500")}>
                {s.safetyGate && (
                  <span className="text-amber-500 font-medium mr-1">Safety:</span>
                )}
                {s.text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

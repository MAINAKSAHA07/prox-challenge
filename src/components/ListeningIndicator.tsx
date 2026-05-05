"use client";

import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type ListeningMode = "standby" | "command" | "busy";

export function ListeningIndicator({
  mode,
  wakeLabel,
  className,
}: {
  mode: ListeningMode;
  /** e.g. "Hey Weld" — shown in standby copy */
  wakeLabel: string;
  className?: string;
}) {
  const label =
    mode === "standby"
      ? `Say “${wakeLabel}” to wake`
      : mode === "command"
        ? "Listening for your question"
        : "One moment…";

  const isActiveMic = mode === "command";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5",
        mode === "busy" || isActiveMic
          ? "border-orange-900/40 bg-orange-950/25"
          : "border-zinc-700/80 bg-zinc-900/40",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible">
        <span
          className={cn(
            "absolute inset-0 rounded-full border-2",
            isActiveMic && "border-orange-500/60 animate-[listening-ring_1.8s_ease-out_infinite]",
            mode === "busy" && "border-orange-500/50",
            mode === "standby" && "border-zinc-600/50",
          )}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full border",
            isActiveMic && "border-orange-400/35 animate-[listening-ring_1.8s_ease-out_infinite_0.45s]",
            mode === "standby" && "border-zinc-600/30",
          )}
        />
        <span
          className={cn(
            "absolute inset-[5px] rounded-full",
            isActiveMic && "bg-orange-600/20 animate-pulse",
            mode === "busy" && "bg-orange-600/15",
            mode === "standby" && "bg-zinc-700/30",
          )}
        />
        <Mic
          className={cn(
            "relative z-[1] h-5 w-5",
            mode === "busy" || isActiveMic
              ? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
              : "text-zinc-500",
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            mode === "busy" || isActiveMic ? "text-orange-400/95" : "text-zinc-500",
          )}
        >
          {mode === "busy" ? "Working" : mode === "standby" ? "Standby" : "Mic on"}
        </p>
        <p className="truncate text-xs text-zinc-300">{label}</p>
        {isActiveMic && (
          <div className="mt-1.5 flex h-5 items-end justify-start gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block h-4 w-1 origin-bottom rounded-sm bg-orange-500/85 animate-[sound-bar_0.85s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

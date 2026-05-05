"use client";

import type { InputVoltage, WeldProcess } from "@/types/weldpilot";

export function DutyCycleCard({
  process,
  voltage,
  amperage,
  dutyCyclePercent,
  weldMinutesPer10,
  restMinutesPer10,
  interpolationNote,
  sourceNote,
  caution,
}: {
  process: WeldProcess;
  voltage: InputVoltage;
  amperage: number;
  dutyCyclePercent: number | null;
  weldMinutesPer10: number | null;
  restMinutesPer10: number | null;
  interpolationNote?: string;
  sourceNote: string;
  caution?: string;
}) {
  const pct = dutyCyclePercent ?? 0;
  const barWeld = dutyCyclePercent != null ? `${pct}%` : "—";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-orange-500/90">
            Duty cycle
          </p>
          <p className="text-lg font-semibold">
            {process} @ {voltage}V — {amperage}A
          </p>
        </div>
        {dutyCyclePercent != null && (
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-500">{dutyCyclePercent}%</p>
            <p className="text-xs text-zinc-500">rated</p>
          </div>
        )}
      </div>

      {dutyCyclePercent != null && weldMinutesPer10 != null && restMinutesPer10 != null && (
        <div>
          <p className="text-xs text-zinc-500 mb-1">10-minute window</p>
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-zinc-800">
            <div
              className="bg-orange-600 h-full transition-all"
              style={{ width: `${dutyCyclePercent}%` }}
              title={`Weld ${weldMinutesPer10} min`}
            />
            <div className="flex-1 bg-zinc-700" title={`Rest ${restMinutesPer10} min`} />
          </div>
          <div className="flex justify-between text-xs mt-1 text-zinc-400">
            <span>
              Weld ~{weldMinutesPer10} min ({barWeld})
            </span>
            <span>Rest ~{restMinutesPer10} min</span>
          </div>
        </div>
      )}

      {interpolationNote && (
        <p className="text-xs text-amber-200/90 bg-amber-950/30 border border-amber-900/50 rounded-md p-2">
          {interpolationNote}
        </p>
      )}

      {caution && (
        <p className="text-xs text-red-200/90 bg-red-950/30 border border-red-900/50 rounded-md p-2">
          {caution}
        </p>
      )}

      <p className="text-[11px] text-zinc-500 border-t border-zinc-800 pt-2">
        Source: {sourceNote}
      </p>
    </div>
  );
}

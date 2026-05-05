"use client";

import type { ProcessRecommendation } from "@/types/weldpilot";

export function ProcessSelectorCard({ recommendation }: { recommendation: ProcessRecommendation }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-orange-500/90">
          Process recommendation
        </p>
        <p className="text-2xl font-bold text-zinc-100">{recommendation.primary}</p>
        {recommendation.alternates.length > 0 && (
          <p className="text-xs text-zinc-500 mt-1">
            Also consider: {recommendation.alternates.join(", ")}
          </p>
        )}
      </div>
      <p className="text-sm text-zinc-300">{recommendation.rationale}</p>
      {recommendation.tradeoffs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 mb-1">Tradeoffs</p>
          <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
            {recommendation.tradeoffs.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendation.setupNotes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-500 mb-1">Setup notes</p>
          <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
            {recommendation.setupNotes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendation.avoid.length > 0 && (
        <div className="rounded-md border border-red-900/50 bg-red-950/20 p-2">
          <p className="text-xs font-medium text-red-300 mb-1">Avoid</p>
          <ul className="list-disc list-inside text-xs text-red-200/80 space-y-1">
            {recommendation.avoid.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

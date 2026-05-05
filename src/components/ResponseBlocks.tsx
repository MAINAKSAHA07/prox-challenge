"use client";

import type { ResponseBlock, WeldPilotResponse } from "@/types/weldpilot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolarityDiagram } from "@/components/artifacts/PolarityDiagram";
import { DutyCycleCard } from "@/components/artifacts/DutyCycleCard";
import { TroubleshootingFlow } from "@/components/artifacts/TroubleshootingFlow";
import { ProcessSelectorCard } from "@/components/artifacts/ProcessSelector";
import { ManualImageCard } from "@/components/artifacts/ManualImageCard";
import { SetupChecklist } from "@/components/artifacts/SetupChecklist";
import { TROUBLESHOOTING_SYMPTOMS } from "@/data/troubleshooting";

function BlockCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-4"}>{children}</CardContent>
    </Card>
  );
}

function renderBlock(block: ResponseBlock, key: string) {
  switch (block.type) {
    case "text_answer":
      return (
        <BlockCard key={key}>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{block.content}</p>
        </BlockCard>
      );
    case "safety_warning": {
      const border =
        block.severity === "critical"
          ? "border-red-800"
          : block.severity === "warning"
            ? "border-amber-800"
            : "border-blue-800";
      return (
        <div
          key={key}
          className={`rounded-xl border ${border} bg-zinc-950/80 p-4 text-sm`}
        >
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
            Safety — {block.severity}
          </p>
          <p className="text-zinc-200">{block.content}</p>
        </div>
      );
    }
    case "manual_reference":
      return (
        <BlockCard key={key} title={block.title}>
          <p className="text-xs text-zinc-500">
            {block.source}
            {block.page != null ? ` · page ${block.page}` : ""}
          </p>
          {block.note && <p className="text-sm mt-2 text-zinc-400">{block.note}</p>}
        </BlockCard>
      );
    case "image_reference":
      return (
        <BlockCard key={key}>
          <ManualImageCard
            title={block.title}
            imagePath={block.imagePath}
            page={block.page}
            caption={block.caption}
          />
        </BlockCard>
      );
    case "polarity_diagram":
      return (
        <BlockCard key={key}>
          <PolarityDiagram
            process={block.process}
            connections={block.connections}
            notes={block.notes}
          />
        </BlockCard>
      );
    case "duty_cycle_calculator":
      return (
        <BlockCard key={key} title="Duty cycle lookup">
          <p className="text-xs text-zinc-500">
            Open the duty cycle card after lookup — process {block.process}, {block.voltage}
            V, {block.amperage}A.
          </p>
        </BlockCard>
      );
    case "duty_cycle_result":
      return (
        <BlockCard key={key}>
          <DutyCycleCard
            process={block.process}
            voltage={block.voltage}
            amperage={block.amperage}
            dutyCyclePercent={block.dutyCyclePercent}
            weldMinutesPer10={block.weldMinutesPer10}
            restMinutesPer10={block.restMinutesPer10}
            interpolationNote={block.interpolationNote}
            sourceNote={block.sourceNote}
            caution={block.caution}
          />
        </BlockCard>
      );
    case "troubleshooting_flowchart": {
      const full = TROUBLESHOOTING_SYMPTOMS[block.symptomId];
      return (
        <BlockCard key={key}>
          <TroubleshootingFlow
            symptomLabel={block.symptomLabel}
            steps={block.steps}
            safetyPreamble={full?.safetyPreamble}
          />
        </BlockCard>
      );
    }
    case "process_selector":
      return (
        <BlockCard key={key}>
          <ProcessSelectorCard recommendation={block.recommendation} />
        </BlockCard>
      );
    case "setup_checklist":
      return (
        <BlockCard key={key}>
          <SetupChecklist title={block.title} steps={block.steps} />
        </BlockCard>
      );
    case "settings_card":
      return (
        <BlockCard key={key} title={block.title}>
          <dl className="space-y-2 text-sm">
            {block.rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 border-b border-zinc-800/80 pb-2">
                <dt className="text-zinc-500">{r.label}</dt>
                <dd className="text-zinc-200 text-right">{r.value}</dd>
              </div>
            ))}
          </dl>
        </BlockCard>
      );
    case "comparison_table":
      return (
        <BlockCard key={key} title={block.title}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-700">
                  {block.columns.map((c) => (
                    <th key={c} className="py-2 pr-3 font-medium text-zinc-400">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 pr-3 text-zinc-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BlockCard>
      );
    default:
      return null;
  }
}

export function ResponseBlocks({ response }: { response: WeldPilotResponse }) {
  return (
    <div className="space-y-4">
      {response.blocks.map((b, i) => renderBlock(b, `${i}-${b.type}`))}
    </div>
  );
}

"use client";

import { Mic, MicOff, Radio, Volume2, VolumeX } from "lucide-react";
import { ListeningIndicator } from "@/components/ListeningIndicator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VoicePhase } from "@/hooks/useVoiceAgent";
import { WAKE_PHRASE_LABEL } from "@/lib/voice/wakeWord";

type VoiceBarProps = {
  /** `null` while detecting in the browser (matches SSR). */
  supported: boolean | null;
  handsFree: boolean;
  onToggleHandsFree: () => void;
  speakReplies: boolean;
  onToggleSpeakReplies: () => void;
  onPushToTalk: () => void;
  phase: VoicePhase;
  lastHeard: string;
  loading: boolean;
};

const phaseLabel = (wake: string): Record<VoicePhase, string> => ({
  off: "",
  listening_wake: `Say “${wake}” — then ask after the greeting.`,
  awaiting_command: "Listening for your question…",
  busy: "Working…",
});

export function VoiceBar({
  supported,
  handsFree,
  onToggleHandsFree,
  speakReplies,
  onToggleSpeakReplies,
  onPushToTalk,
  phase,
  lastHeard,
  loading,
}: VoiceBarProps) {
  if (supported === null) {
    return (
      <div
        className="h-[72px] rounded-lg border border-zinc-800 bg-zinc-900/30"
        aria-hidden
      />
    );
  }

  if (!supported) {
    return (
      <p className="text-[11px] text-zinc-600 px-1">
        Voice needs a Chromium-based browser (Chrome, Edge) over HTTPS or localhost.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={handsFree ? "default" : "outline"}
          size="sm"
          onClick={onToggleHandsFree}
          className="gap-1.5"
          title={`Listen for “${WAKE_PHRASE_LABEL}”; after each reply it goes to standby until you say it again`}
        >
          {handsFree ? (
            <Radio className="h-3.5 w-3.5" />
          ) : (
            <MicOff className="h-3.5 w-3.5" />
          )}
          Hands-free
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPushToTalk}
          disabled={loading}
          className="gap-1.5"
          title="One-shot dictation (tap, speak, release)"
        >
          <Mic className="h-3.5 w-3.5" />
          Speak once
        </Button>
        <button
          type="button"
          onClick={onToggleSpeakReplies}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
            speakReplies
              ? "border-orange-800 bg-orange-950/40 text-orange-300"
              : "border-zinc-700 text-zinc-500 hover:border-zinc-600",
          )}
        >
          {speakReplies ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
          Read replies
        </button>
      </div>
      {handsFree && (
        <div className="flex flex-col gap-2 px-0.5">
          {!loading && phase !== "off" && (
            <ListeningIndicator
              wakeLabel={WAKE_PHRASE_LABEL}
              mode={
                phase === "busy"
                  ? "busy"
                  : phase === "awaiting_command"
                    ? "command"
                    : "standby"
              }
            />
          )}
          {loading && (
            <ListeningIndicator wakeLabel={WAKE_PHRASE_LABEL} mode="busy" />
          )}
          <div className="flex flex-col gap-0.5 px-1">
            <p
              className={cn(
                "text-[11px] font-medium",
                phase === "awaiting_command" ? "text-orange-400" : "text-zinc-500",
              )}
            >
              {phaseLabel(WAKE_PHRASE_LABEL)[phase]}
              {loading ? " (chat loading)" : ""}
            </p>
            {lastHeard && (
              <p className="text-[10px] text-zinc-600 truncate" title={lastHeard}>
                Heard: {lastHeard}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

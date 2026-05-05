"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponseBlocks } from "@/components/ResponseBlocks";
import { VoiceBar } from "@/components/VoiceBar";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import type { WeldPilotResponse } from "@/types/weldpilot";
import { cn } from "@/lib/utils";
import { WAKE_PHRASE_LABEL } from "@/lib/voice/wakeWord";

const QUICK_PROMPTS = [
  "MIG 200A on 240V duty cycle",
  "Show flux-core polarity",
  "Why is my weld porous?",
  "Help me choose a process",
  "Set up wire feed",
  "Show front panel controls",
  "What polarity for TIG? Where does ground clamp go?",
  "Wire feed motor runs but wire does not feed",
];

type Msg = { role: "user" | "assistant"; content: string; response?: WeldPilotResponse };

export function ChatExperience() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<WeldPilotResponse | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);

  const speakAnswerRef = useRef<(text: string) => void>(() => {});
  const resumeListeningRef = useRef<() => void>(() => {});
  const messagesRef = useRef<Msg[]>([]);
  const sendingRef = useRef(false);
  const speakRepliesRef = useRef(speakReplies);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (sendingRef.current) return;
    sendingRef.current = true;

    setError(null);
    setLoading(true);
    setInput("");

    const userMsg = { role: "user" as const, content: trimmed };
    const thread = [...messagesRef.current, userMsg];
    messagesRef.current = thread;
    setMessages(thread);

    let wp: WeldPilotResponse | null = null;
    try {
      const payload = {
        messages: thread.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };
      if (!payload.messages.length) {
        throw new Error("No messages to send");
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      wp = data as WeldPilotResponse;
      const withAssistant: Msg[] = [
        ...thread,
        {
          role: "assistant",
          content: wp.answer,
          response: wp,
        },
      ];
      messagesRef.current = withAssistant;
      setMessages(withAssistant);
      setActiveArtifact(wp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      const rolled = thread.slice(0, -1);
      messagesRef.current = rolled;
      setMessages(rolled);
    } finally {
      sendingRef.current = false;
      setLoading(false);
      const sr = speakRepliesRef.current;
      queueMicrotask(() => {
        if (wp && sr) speakAnswerRef.current(wp.answer);
        else resumeListeningRef.current();
      });
    }
  }, []);

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const onVoiceMessage = useCallback((t: string) => {
    void sendRef.current(t);
  }, []);

  const {
    supported: voiceSupported,
    enabled: handsFreeVoice,
    phase: voicePhase,
    lastHeard,
    toggleEnabled: toggleHandsFree,
    pushToTalk,
    speakAnswer,
    resumeListening,
  } = useVoiceAgent({
    onUserMessage: onVoiceMessage,
    speakReplies,
    loading,
  });

  useEffect(() => {
    speakAnswerRef.current = speakAnswer;
  }, [speakAnswer]);

  useEffect(() => {
    resumeListeningRef.current = resumeListening;
  }, [resumeListening]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-[1600px] mx-auto">
      <div className="flex flex-1 min-h-0 border-t border-zinc-800">
        <div className="flex flex-1 flex-col min-w-0 border-r border-zinc-800">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
                Ask about duty cycle, polarity, troubleshooting, or setup. Use the
                chips below, or enable{" "}
                <span className="text-orange-400/90">Hands-free</span> and say{" "}
                <span className="text-orange-400/90">{WAKE_PHRASE_LABEL}</span> to
                wake the assistant. After each answer it goes back to standby until you
                say <span className="text-orange-400/90">{WAKE_PHRASE_LABEL}</span>{" "}
                again.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <button
                  type="button"
                  onClick={() => m.response && setActiveArtifact(m.response)}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-4 py-2 text-sm text-left",
                    m.role === "user"
                      ? "bg-orange-600 text-white rounded-br-md"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-md hover:ring-1 hover:ring-orange-500/50",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.response && (
                    <p className="text-[10px] text-zinc-500 mt-2">
                      Confidence: {m.response.confidence} · tap to show artifacts
                    </p>
                  )}
                </button>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                WeldPilot is thinking…
              </div>
            )}
          </div>
          <div className="p-3 border-t border-zinc-800 space-y-2 bg-zinc-950/50">
            <VoiceBar
              supported={voiceSupported}
              handsFree={handsFreeVoice}
              onToggleHandsFree={toggleHandsFree}
              speakReplies={speakReplies}
              onToggleSpeakReplies={() => setSpeakReplies((s) => !s)}
              onPushToTalk={pushToTalk}
              phase={voicePhase}
              lastHeard={lastHeard}
              loading={loading}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={loading}
                  className="text-[11px] rounded-full border border-zinc-700 px-2.5 py-1 text-zinc-400 hover:border-orange-600 hover:text-orange-400 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask WeldPilot…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Button
                type="button"
                onClick={() => send(input)}
                disabled={loading}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>
        <aside className="hidden lg:flex w-[min(440px,40vw)] flex-col bg-zinc-950/30">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Artifacts
            </p>
            <p className="text-sm font-medium text-zinc-200">
              Diagrams, duty cycle, manuals
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeArtifact ? (
              <ResponseBlocks response={activeArtifact} />
            ) : (
              <p className="text-sm text-zinc-600">
                Send a message — structured blocks render here.
              </p>
            )}
          </div>
        </aside>
      </div>
      <section className="lg:hidden border-t border-zinc-800 bg-zinc-950/40 p-4 max-h-[50vh] overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
          Artifacts (mobile)
        </p>
        {activeArtifact ? (
          <ResponseBlocks response={activeArtifact} />
        ) : (
          <p className="text-sm text-zinc-600">No artifact yet.</p>
        )}
      </section>
    </div>
  );
}

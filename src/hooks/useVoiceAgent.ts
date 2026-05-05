"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  getSpeechRecognitionCtor,
  speak,
  stopSpeaking,
  type SpeechRecognitionLike,
} from "@/lib/voice/browserSpeech";
import { useSpeechCapability } from "@/lib/voice/useSpeechCapability";
import {
  hasWakePhrase,
  stripWakePhrase,
  VOICE_GREETING,
} from "@/lib/voice/wakeWord";

export type VoicePhase =
  | "off"
  | "listening_wake"
  | "awaiting_command"
  | "busy";

type UseVoiceAgentOptions = {
  onUserMessage: (text: string) => void | Promise<void>;
  speakReplies: boolean;
  loading: boolean;
};

const MIN_COMMAND_LEN = 4;
const MIN_WAKE_REMAINDER = 6;
const INTERIM_WAKE_MS = 380;

export function useVoiceAgent({
  onUserMessage,
  speakReplies,
  loading,
}: UseVoiceAgentOptions) {
  const [enabled, setEnabled] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>("off");
  const [lastHeard, setLastHeard] = useState("");
  const supported = useSpeechCapability();

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const phaseRef = useRef<VoicePhase>("off");
  const enabledRef = useRef(false);
  const loadingRef = useRef(false);
  const onUserMessageRef = useRef(onUserMessage);
  const speakRepliesRef = useRef(speakReplies);
  const startRecognitionImplRef = useRef<
    (opts?: { skipLoadingCheck?: boolean }) => void
  >(() => {});

  useEffect(() => {
    onUserMessageRef.current = onUserMessage;
  }, [onUserMessage]);

  useEffect(() => {
    speakRepliesRef.current = speakReplies;
  }, [speakReplies]);

  /** After commit, before paint — earlier than useEffect so guards match `loading` before parent effects/microtasks. */
  useLayoutEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const startRecognition = useCallback(
    (opts?: { skipLoadingCheck?: boolean }) => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !enabledRef.current) return;
    if (!opts?.skipLoadingCheck && loadingRef.current) return;

    recRef.current?.abort();
    const rec = new Ctor();
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    try {
      (rec as SpeechRecognitionLike & { maxAlternatives?: number }).maxAlternatives =
        5;
    } catch {
      /* optional */
    }

    const transcriptRef = { aggregatedFinal: "", combined: "" };
    let lastProcessed = "";
    /** Previous finalized phrase — merge with next if wake spans two finals ("hey" | "pilot"). */
    let prevFinalPhrase = "";
    let interimWakeTimer: ReturnType<typeof setTimeout> | null = null;

    const clearInterimWakeTimer = () => {
      if (interimWakeTimer) {
        clearTimeout(interimWakeTimer);
        interimWakeTimer = null;
      }
    };

    const processFinalText = (raw: string) => {
      const finalsOnly = raw.trim();
      if (!finalsOnly) return;
      if (finalsOnly === lastProcessed) return;
      const p = phaseRef.current;
      if (p === "busy") return;

      if (p === "listening_wake") {
        if (!hasWakePhrase(finalsOnly)) return;
        clearInterimWakeTimer();
        lastProcessed = finalsOnly;
        const remainder = stripWakePhrase(finalsOnly);
        if (remainder.length >= MIN_WAKE_REMAINDER) {
          prevFinalPhrase = "";
          void onUserMessageRef.current(remainder);
          return;
        }
        rec.stop();
        setPhase("busy");
        phaseRef.current = "busy";
        speak(VOICE_GREETING, () => {
          if (!enabledRef.current) return;
          lastProcessed = "";
          prevFinalPhrase = "";
          setPhase("awaiting_command");
          phaseRef.current = "awaiting_command";
          startRecognitionImplRef.current({ skipLoadingCheck: true });
        });
        return;
      }

      if (p === "awaiting_command") {
        if (finalsOnly.length < MIN_COMMAND_LEN) return;
        if (hasWakePhrase(finalsOnly) && stripWakePhrase(finalsOnly).length < MIN_COMMAND_LEN) {
          lastProcessed = finalsOnly;
          clearInterimWakeTimer();
          rec.stop();
          speak(VOICE_GREETING, () => {
            if (!enabledRef.current) return;
            lastProcessed = "";
            prevFinalPhrase = "";
            phaseRef.current = "awaiting_command";
            startRecognitionImplRef.current({ skipLoadingCheck: true });
          });
          return;
        }
        const toSend = hasWakePhrase(finalsOnly)
          ? stripWakePhrase(finalsOnly)
          : finalsOnly;
        if (toSend.length < MIN_COMMAND_LEN) return;
        lastProcessed = finalsOnly;
        clearInterimWakeTimer();
        prevFinalPhrase = "";
        void onUserMessageRef.current(toSend);
        setPhase("listening_wake");
        phaseRef.current = "listening_wake";
      }
    };

    rec.onresult = (ev) => {
      if (!enabledRef.current || loadingRef.current) return;

      let fullFinal = "";
      let fullInterim = "";
      let display = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        const piece = r[0]?.transcript ?? "";
        display += piece;
        if (r.isFinal) fullFinal += piece;
        else fullInterim += piece;
      }
      const combined = (fullFinal + fullInterim).trim();
      transcriptRef.aggregatedFinal = fullFinal.trim();
      transcriptRef.combined = combined;
      if (display.trim()) setLastHeard(display.trim());

      /**
       * Process only NEW finalized segments (resultIndex..end). Feeding one giant
       * concatenation of the whole session makes wake matching unreliable and blocks
       * on stale `lastProcessed`.
       */
      const newFinals: string[] = [];
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (!r.isFinal) continue;
        const phrase = (r[0]?.transcript ?? "").trim();
        if (phrase) newFinals.push(phrase);
      }

      for (const phrase of newFinals) {
        if (
          prevFinalPhrase &&
          !hasWakePhrase(prevFinalPhrase) &&
          !hasWakePhrase(phrase)
        ) {
          const merged = `${prevFinalPhrase} ${phrase}`.trim();
          if (hasWakePhrase(merged)) {
            processFinalText(merged);
            prevFinalPhrase = "";
            continue;
          }
        }
        processFinalText(phrase);
        prevFinalPhrase = phrase;
      }

      /** Interim: wake phrase final can lag — debounce on live interim text. */
      const lastIdx = ev.results.length - 1;
      if (lastIdx >= 0 && phaseRef.current === "listening_wake") {
        const last = ev.results[lastIdx];
        const live = (last[0]?.transcript ?? "").trim();
        if (!last.isFinal && live.length >= 5 && hasWakePhrase(live)) {
          clearInterimWakeTimer();
          interimWakeTimer = setTimeout(() => {
            interimWakeTimer = null;
            if (!enabledRef.current || loadingRef.current) return;
            if (phaseRef.current !== "listening_wake") return;
            processFinalText(live);
          }, INTERIM_WAKE_MS);
        }
      }
    };

    rec.onspeechend = () => {
      if (!enabledRef.current || loadingRef.current) return;
      clearInterimWakeTimer();
      const t = transcriptRef.combined.trim();
      if (!t) return;
      /** Avoid feeding the whole multi-utterance session; wake is usually in the latest clause. */
      const windowed =
        phaseRef.current === "listening_wake"
          ? t.length > 96
            ? t.slice(-96)
            : t
          : t.length > 220
            ? t.slice(-220)
            : t;
      processFinalText(windowed);
    };

    rec.onerror = (ev) => {
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      console.warn("speech recognition:", ev.error);
    };

    rec.onend = () => {
      if (!enabledRef.current) return;
      if (loadingRef.current) return;
      if (phaseRef.current === "busy") return;
      if (recRef.current !== rec) return;
      try {
        rec.start();
      } catch {
        /* already running */
      }
    };

    try {
      rec.start();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    startRecognitionImplRef.current = startRecognition;
  }, [startRecognition]);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!enabled || supported !== true) return;
    if (loading) {
      recRef.current?.stop();
    }
  }, [loading, enabled, supported]);

  const resumeListening = useCallback(() => {
    if (!enabledRef.current) return;
    setPhase("listening_wake");
    phaseRef.current = "listening_wake";
    /** After chat, `loading` may not have flushed to this ref before the parent microtask — skip guard. */
    startRecognitionImplRef.current({ skipLoadingCheck: true });
  }, []);

  const toggleEnabled = useCallback(() => {
    if (supported !== true) return;
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      if (!next) {
        recRef.current?.abort();
        recRef.current = null;
        stopSpeaking();
        phaseRef.current = "off";
        queueMicrotask(() => setPhase("off"));
      } else {
        queueMicrotask(() => {
          setPhase("listening_wake");
          phaseRef.current = "listening_wake";
          startRecognitionImplRef.current();
        });
      }
      return next;
    });
  }, [supported]);

  const pushToTalk = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    recRef.current?.abort();
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (ev) => {
      let text = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        text += r[0]?.transcript ?? "";
      }
      const t = text.trim();
      if (!t) return;
      setLastHeard(t);
      if (hasWakePhrase(t)) {
        const r = stripWakePhrase(t);
        if (r.length >= MIN_WAKE_REMAINDER) void onUserMessageRef.current(r);
        else speak(VOICE_GREETING);
      } else {
        void onUserMessageRef.current(t);
      }
    };

    rec.onend = () => {
      if (enabledRef.current && !loadingRef.current) resumeListening();
    };

    try {
      rec.start();
    } catch {
      /* ignore */
    }
  }, [resumeListening]);

  const speakAnswer = useCallback(
    (text: string) => {
      if (!speakRepliesRef.current) return;
      recRef.current?.stop();
      const snippet = text.slice(0, 1200);
      speak(snippet, () => {
        if (enabledRef.current && !loadingRef.current) resumeListening();
      });
    },
    [resumeListening],
  );

  return {
    supported,
    enabled,
    phase,
    lastHeard,
    toggleEnabled,
    pushToTalk,
    speakAnswer,
    resumeListening,
    setEnabled,
  };
}

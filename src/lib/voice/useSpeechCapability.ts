import { useSyncExternalStore } from "react";
import { isSpeechRecognitionSupported } from "@/lib/voice/browserSpeech";

let clientSnapshot: boolean | null = null;
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (typeof window !== "undefined" && clientSnapshot === null) {
    queueMicrotask(() => {
      clientSnapshot = isSpeechRecognitionSupported();
      listeners.forEach((l) => l());
    });
  }
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): boolean | null {
  if (typeof window === "undefined") return null;
  return clientSnapshot;
}

function getServerSnapshot(): boolean | null {
  return null;
}

/**
 * `null` during SSR and the first client paint, then the real `SpeechRecognition` availability.
 * Avoids hydration mismatch from reading `window` during initial render.
 */
export function useSpeechCapability(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

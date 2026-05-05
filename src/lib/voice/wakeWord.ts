/** Compact alnum form for fuzzy wake matching (STT often drops spaces). */
export function compactAlpha(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

/** Shown in UI — user speaks this to wake hands-free. */
export const WAKE_PHRASE_LABEL = "Hey Pilot";

/**
 * Wake phrase: "Hey Pilot" (+ common STT variants). Regex-only on the raw
 * transcript avoids brittle compact substring matches across unrelated words.
 */
export function hasWakePhrase(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return false;

  const hey = String.raw`(?:hey|hay|hei)`;
  const pilotWord = String.raw`\bpilot(?:ing|s)?\b`;

  if (new RegExp(String.raw`\b${hey}\b[\s,!'~.-]{0,6}${pilotWord}`, "i").test(t)) {
    return true;
  }
  if (/\bheypilot\b/i.test(t)) return true;
  if (/\bhaypilot\b/i.test(t)) return true;
  if (/\bhei[\s,]*pilot\b/i.test(t)) return true;

  const c = compactAlpha(t);
  /** Glued token without space, e.g. STT returns "heypilot" as one word. */
  if (c.length >= 8 && /^(?:hey|hay|hei)pilot/.test(c)) return true;

  return false;
}

/** Remove wake phrase variants so remainder can be sent as the user question. */
export function stripWakePhrase(text: string): string {
  let out = text;
  const patterns: RegExp[] = [
    /\b(?:hey|hay|hei)\b[\s,!'~.-]{0,6}\bpilot(?:ing|s)?\b/gi,
    /\bheypilot\b/gi,
    /\bhaypilot\b/gi,
    /\bhei[\s,]*pilot\b/gi,
  ];
  for (const re of patterns) {
    out = out.replace(re, " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

export const VOICE_GREETING = "How can I help you?";

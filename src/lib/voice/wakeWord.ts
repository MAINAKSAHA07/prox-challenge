/** Compact alnum form for fuzzy wake matching (STT often drops spaces). */
export function compactAlpha(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

/** Shown in UI — user speaks this to wake hands-free. */
export const WAKE_PHRASE_LABEL = "Hey Weld";

/**
 * Wake phrase: "Hey Weld" (+ common STT variants). Regex-only on the raw
 * transcript avoids false positives like "theyweld" from compact heuristics.
 */
export function hasWakePhrase(text: string): boolean {
  const t = text.trim();
  if (t.length < 3) return false;

  const hey = String.raw`(?:hey|hay|hei|a)`;
  const weldWord = String.raw`\bweld(?:ing|er|ed|s)?\b`;

  if (new RegExp(String.raw`\b${hey}\b[\s,!'~.-]{0,6}${weldWord}`, "i").test(t)) {
    return true;
  }
  if (/\bheyweld\b/i.test(t)) return true;
  if (/\bhayweld\b/i.test(t)) return true;
  if (/\bhei[\s,]*weld\b/i.test(t)) return true;

  const c = compactAlpha(t);
  /** Glued token without space, e.g. STT returns "heyweld" as one word (not "theyweld"). */
  if (c.length >= 7 && /^(?:hey|hay|hei|a)weld/.test(c)) return true;

  return false;
}

/** Remove wake phrase variants so remainder can be sent as the user question. */
export function stripWakePhrase(text: string): string {
  let out = text;
  const patterns: RegExp[] = [
    /\b(?:hey|hay|hei|a)\b[\s,!'~.-]{0,6}\bweld(?:ing|er|ed|s)?\b/gi,
    /\bheyweld\b/gi,
    /\bhayweld\b/gi,
    /\bhei[\s,]*weld\b/gi,
  ];
  for (const re of patterns) {
    out = out.replace(re, " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

export const VOICE_GREETING = "How can I help you?";

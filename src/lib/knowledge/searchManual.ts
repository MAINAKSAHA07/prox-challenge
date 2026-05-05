import manualChunks from "@/data/manualChunks.json";

type Chunk = { id: string; source: string; text: string };

const chunks = manualChunks as Chunk[];

function score(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  let s = 0;
  for (const t of terms) {
    if (!t) continue;
    if (lower.includes(t)) s += 3;
    const re = new RegExp(`\\b${escapeReg(t)}`, "i");
    if (re.test(lower)) s += 2;
  }
  return s;
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchManual(query: string, limit = 6): Chunk[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9%-]/g, ""))
    .filter((t) => t.length > 2);

  if (terms.length === 0) return [];

  const ranked = chunks
    .map((c) => ({ c, s: score(c.text, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);

  return ranked;
}

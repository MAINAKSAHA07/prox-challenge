import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

const root = path.join(__dirname, "..");
const filesDir = path.join(root, "files");
const outDir = path.join(root, "src", "data");
const outFile = path.join(outDir, "manualChunks.json");

type Chunk = { id: string; source: string; text: string };

function slidingChunks(text: string, source: string, size: number): Chunk[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const chunks: Chunk[] = [];
  for (let i = 0, n = 0; i < cleaned.length; i += size, n++) {
    chunks.push({
      id: `${source}-${n}`,
      source,
      text: cleaned.slice(i, i + size),
    });
  }
  return chunks;
}

async function extractPdf(filename: string) {
  const buf = await readFile(path.join(filesDir, filename));
  const data = await pdf(buf);
  return slidingChunks(data.text, filename, 900);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const all = [
    ...(await extractPdf("owner-manual.pdf")),
    ...(await extractPdf("quick-start-guide.pdf")),
    ...(await extractPdf("selection-chart.pdf")),
  ];
  await writeFile(outFile, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} chunks to ${path.relative(root, outFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

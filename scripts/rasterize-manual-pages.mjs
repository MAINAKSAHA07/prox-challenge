import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdf } from "pdf-to-img";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "manual-pages");

const jobs = [
  {
    file: path.join(root, "files", "owner-manual.pdf"),
    pages: [
      [7, "duty-cycle.png"],
      [8, "front-panel.png"],
      [9, "interior-controls.png"],
      [13, "polarity-flux.png"],
      [14, "polarity-mig-tig.png"],
      [17, "spool-gun.png"],
      [19, "duty-cycle-explained.png"],
      [42, "troubleshooting-1.png"],
      [43, "troubleshooting-2.png"],
    ],
  },
  {
    file: path.join(root, "files", "quick-start-guide.pdf"),
    pages: [
      [1, "quickstart-1.png"],
      [2, "quickstart-2.png"],
    ],
  },
  {
    file: path.join(root, "files", "selection-chart.pdf"),
    pages: [[1, "selection-chart.png"]],
  },
];

async function renderPage(doc, pageNum, outName) {
  const buf = await doc.getPage(pageNum);
  await writeFile(path.join(outDir, outName), buf);
  console.log(`wrote ${outName} (source page ${pageNum})`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  for (const job of jobs) {
    const doc = await pdf(job.file, { scale: 2 });
    for (const [pageNum, name] of job.pages) {
      await renderPage(doc, pageNum, name);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

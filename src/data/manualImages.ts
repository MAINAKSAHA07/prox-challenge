export type ManualImageEntry = {
  id: string;
  topic: string;
  title: string;
  imagePath: string;
  source: string;
  page?: number;
  caption?: string;
};

/** Registry of bundled visuals — paths are served from /public */
export const MANUAL_IMAGES: ManualImageEntry[] = [
  {
    id: "product-hero",
    topic: "machine_overview",
    title: "OmniPro 220 — exterior",
    imagePath: "/product.webp",
    source: "product.webp",
    caption: "Overall machine view for orientation.",
  },
  {
    id: "product-inside",
    topic: "interior_controls",
    title: "Interior panel & wire path",
    imagePath: "/product-inside.webp",
    source: "product-inside.webp",
    caption: "Drive rolls, tensioner, and internal routing reference.",
  },
  {
    id: "duty-cycle-specs",
    topic: "duty_cycle",
    title: "Specifications / duty cycle table",
    imagePath: "/manual-pages/duty-cycle.png",
    source: "owner-manual.pdf",
    page: 7,
    caption: "Rated duty cycle anchors by process and input voltage.",
  },
  {
    id: "front-panel",
    topic: "front_panel",
    title: "Front panel controls",
    imagePath: "/manual-pages/front-panel.png",
    source: "owner-manual.pdf",
    page: 8,
    caption: "LCD, knobs, and torch connector overview.",
  },
  {
    id: "interior-labeled",
    topic: "wire_feed_internals",
    title: "Interior controls (labeled)",
    imagePath: "/manual-pages/interior-controls.png",
    source: "owner-manual.pdf",
    page: 9,
    caption: "Drive assembly, tensioner, and wire path.",
  },
  {
    id: "polarity-flux",
    topic: "polarity_flux",
    title: "Flux-Cored polarity illustration",
    imagePath: "/manual-pages/polarity-flux.png",
    source: "owner-manual.pdf",
    page: 13,
  },
  {
    id: "polarity-mig-tig",
    topic: "polarity_mig_tig",
    title: "MIG / TIG cable routing",
    imagePath: "/manual-pages/polarity-mig-tig.png",
    source: "owner-manual.pdf",
    page: 14,
  },
  {
    id: "spool-gun",
    topic: "spool_gun",
    title: "Spool gun setup",
    imagePath: "/manual-pages/spool-gun.png",
    source: "owner-manual.pdf",
    page: 17,
  },
  {
    id: "duty-cycle-explained",
    topic: "duty_cycle_explained",
    title: "Duty cycle explanation",
    imagePath: "/manual-pages/duty-cycle-explained.png",
    source: "owner-manual.pdf",
    page: 19,
  },
  {
    id: "troubleshooting-a",
    topic: "troubleshooting",
    title: "Troubleshooting (part 1)",
    imagePath: "/manual-pages/troubleshooting-1.png",
    source: "owner-manual.pdf",
    page: 42,
  },
  {
    id: "troubleshooting-b",
    topic: "troubleshooting",
    title: "Troubleshooting (part 2)",
    imagePath: "/manual-pages/troubleshooting-2.png",
    source: "owner-manual.pdf",
    page: 43,
  },
  {
    id: "quickstart-wire",
    topic: "wire_setup",
    title: "Quick Start — wire installation",
    imagePath: "/manual-pages/quickstart-1.png",
    source: "quick-start-guide.pdf",
    page: 1,
  },
  {
    id: "quickstart-cables",
    topic: "cable_setup",
    title: "Quick Start — cable routing",
    imagePath: "/manual-pages/quickstart-2.png",
    source: "quick-start-guide.pdf",
    page: 2,
  },
  {
    id: "selection-chart",
    topic: "process_selection",
    title: "Welding process selection chart",
    imagePath: "/manual-pages/selection-chart.png",
    source: "selection-chart.pdf",
    page: 1,
  },
];

export function getManualImageByTopic(topic: string): ManualImageEntry | undefined {
  const t = topic.toLowerCase();
  return MANUAL_IMAGES.find(
    (e) =>
      e.topic === t ||
      e.id === t ||
      e.title.toLowerCase().includes(t),
  );
}

export function searchManualImages(query: string): ManualImageEntry[] {
  const q = query.toLowerCase();
  return MANUAL_IMAGES.filter(
    (e) =>
      e.topic.includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.caption?.toLowerCase().includes(q),
  );
}

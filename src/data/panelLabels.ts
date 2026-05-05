export type ControlLabel = { id: string; label: string; detail: string };

export const FRONT_PANEL_LABELS: ControlLabel[] = [
  {
    id: "lcd",
    label: "LCD / synergic control",
    detail: "Process selection, parameters, menus — primary interface.",
  },
  {
    id: "trigger",
    label: "Torch trigger / gun socket",
    detail: "MIG gun or spool gun connection per process.",
  },
  {
    id: "work-pos",
    label: "Positive socket",
    detail: "Route per process polarity diagram (not always 'positive to work').",
  },
  {
    id: "work-neg",
    label: "Negative socket",
    detail: "Route per process polarity diagram.",
  },
  {
    id: "power",
    label: "Power switch & input",
    detail: "Follow lockout/tagout discipline for service.",
  },
];

export const INTERIOR_CONTROL_LABELS: ControlLabel[] = [
  {
    id: "drive-rolls",
    label: "Drive rolls",
    detail: "Groove must match wire type and diameter.",
  },
  {
    id: "tensioner",
    label: "Wire tensioner",
    detail: "Too loose slips; too tight deforms wire.",
  },
  {
    id: "spool-brake",
    label: "Spool hub / brake",
    detail: "Controls overrun; adjust per manual.",
  },
  {
    id: "inlet",
    label: "Wire inlet guide",
    detail: "Misalignment here causes bird nests.",
  },
];

export function getFrontPanelLabels() {
  return FRONT_PANEL_LABELS;
}

export function getInteriorControlLabels() {
  return INTERIOR_CONTROL_LABELS;
}

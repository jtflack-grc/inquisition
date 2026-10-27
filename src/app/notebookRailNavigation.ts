export const NOTEBOOK_RAIL_EVENT = "inquisition:notebook-rail";

export type NotebookRailDetail =
  | { rail: "evidence"; incidentId: string; section: "intel-evidence" | "intel-limits" | "intel-timeline" }
  | { rail: "model"; incidentId: string; category?: string; tab: "basic" | "advanced" | "fair_native" };

/** Navigate existing rails without changing the selected case or model inputs. */
export function navigateNotebookRail(detail: NotebookRailDetail) {
  window.dispatchEvent(new CustomEvent<NotebookRailDetail>(NOTEBOOK_RAIL_EVENT, { detail }));
}

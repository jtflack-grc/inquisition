import type { Incident, MaterialityOverrides } from "./types";

export type SectorPresetId =
  | "neutral"
  | "healthcare"
  | "retail_pci"
  | "financial"
  | "tech_saas"
  | "industrial_ot";

const PRESET_LABELS: Record<SectorPresetId, string> = {
  neutral: "Neutral (incident defaults)",
  healthcare: "Healthcare / HIPAA",
  retail_pci: "Retail / PCI",
  financial: "Financial services",
  tech_saas: "Tech / SaaS",
  industrial_ot: "Industrial / OT",
};

export function sectorPresetLabel(id: SectorPresetId): string {
  return PRESET_LABELS[id];
}

/**
 * Materiality input biases by sector — does not replace case evidence; nudges defaults for workshops.
 */
export function sectorPresetOverrides(
  incident: Incident,
  preset: SectorPresetId
): MaterialityOverrides {
  if (preset === "neutral") return {};

  const d = incident.modelingDefaults ?? {};
  const baseRecords = d.recordsMillions ?? 0;
  const baseDown = d.downtimeDays ?? 0;
  switch (preset) {
    case "healthcare":
      return {
        recordsMillions: Math.max(baseRecords * 1.2, baseRecords || 0.5),
        downtimeDays: baseDown,
      };
    case "retail_pci":
      return {
        recordsMillions: Math.max(baseRecords * 1.15, baseRecords || 1),
        downtimeDays: baseDown,
      };
    case "financial":
      return {
        downtimeDays: baseDown,
      };
    case "tech_saas":
      return {
        downtimeDays: Math.max(Math.ceil(baseDown * 1.25), baseDown || 1),
        recordsMillions: baseRecords,
      };
    case "industrial_ot":
      return {
        downtimeDays: Math.max(Math.ceil((baseDown || 2) * 1.45), 1),
        recordsMillions: baseRecords * 0.85,
      };
    default:
      return {};
  }
}

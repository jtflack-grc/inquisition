import { create } from "zustand";
import type { Incident, MaterialityOverrides } from "../inquisition/types";
import { SEEDED_INCIDENTS } from "../inquisition/seedIncidents";

export interface IncidentState {
  incidents: Incident[];
  selectedIncidentId: string | null;
  incidentQuery: string;
  materialityOverridesByIncidentId: Record<string, MaterialityOverrides>;
  /** True after seed is applied (always true at init for MVP). */
  hydrated: boolean;
  setSelectedIncidentId: (id: string) => void;
  setIncidentQuery: (q: string) => void;
  setMaterialityOverridesForIncident: (
    incidentId: string,
    overrides: MaterialityOverrides
  ) => void;
  clearMaterialityOverridesForIncident: (incidentId: string) => void;
  getMaterialityOverrides: (
    incidentId: string
  ) => MaterialityOverrides | undefined;
}

const firstId = SEEDED_INCIDENTS[0]?.id ?? null;

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: SEEDED_INCIDENTS,
  selectedIncidentId: firstId,
  incidentQuery: "",
  materialityOverridesByIncidentId: {},
  hydrated: true,

  setSelectedIncidentId: (id) => {
    const exists = get().incidents.some((i) => i.id === id);
    if (exists) set({ selectedIncidentId: id });
  },

  setIncidentQuery: (q) => set({ incidentQuery: q }),

  setMaterialityOverridesForIncident: (incidentId, overrides) =>
    set((s) => ({
      materialityOverridesByIncidentId: {
        ...s.materialityOverridesByIncidentId,
        [incidentId]: {
          ...s.materialityOverridesByIncidentId[incidentId],
          ...overrides,
        },
      },
    })),

  clearMaterialityOverridesForIncident: (incidentId) =>
    set((s) => {
      const next = { ...s.materialityOverridesByIncidentId };
      delete next[incidentId];
      return { materialityOverridesByIncidentId: next };
    }),

  getMaterialityOverrides: (incidentId) =>
    get().materialityOverridesByIncidentId[incidentId],
}));

export function selectFilteredIncidents(state: IncidentState): Incident[] {
  const q = state.incidentQuery.trim().toLowerCase();
  if (!q) return state.incidents;
  return state.incidents.filter((i) => {
    const blob = [
      i.company.name,
      i.incidentTitle,
      i.incidentSummary,
      i.incidentTypeLabel,
      ...i.taxonomyTags,
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function selectSelectedIncident(state: IncidentState): Incident | null {
  if (!state.selectedIncidentId) return null;
  return state.incidents.find((i) => i.id === state.selectedIncidentId) ?? null;
}

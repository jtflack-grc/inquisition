import { create } from "zustand";

interface TimelinePlaybackState {
  incidentId: string | null;
  step: number | null;
  playing: boolean;
  stepStartedAt: number;
  start: (incidentId: string, step?: number) => void;
  pause: () => void;
  setStep: (incidentId: string, step: number) => void;
  reset: () => void;
}

export const useTimelinePlaybackStore = create<TimelinePlaybackState>(
  (set) => ({
    incidentId: null,
    step: null,
    playing: false,
    stepStartedAt: 0,

    start: (incidentId, step = 0) =>
      set({
        incidentId,
        step,
        playing: true,
        stepStartedAt: Date.now(),
      }),

    pause: () => set({ playing: false }),

    setStep: (incidentId, step) =>
      set({
        incidentId,
        step,
        stepStartedAt: Date.now(),
      }),

    reset: () =>
      set({
        incidentId: null,
        step: null,
        playing: false,
        stepStartedAt: 0,
      }),
  })
);

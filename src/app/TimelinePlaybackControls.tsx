import { useEffect } from "react";
import type { Incident } from "../inquisition/types";
import { useTimelinePlaybackStore } from "../store/timelinePlaybackStore";

const STEP_MS = 2400;

export function TimelinePlaybackControls({ incident }: { incident: Incident }) {
  const timeline = incident.disclosureTimeline ?? [];
  const playbackIncidentId = useTimelinePlaybackStore((s) => s.incidentId);
  const playbackStep = useTimelinePlaybackStore((s) => s.step);
  const playing = useTimelinePlaybackStore((s) => s.playing);
  const start = useTimelinePlaybackStore((s) => s.start);
  const pause = useTimelinePlaybackStore((s) => s.pause);
  const setStep = useTimelinePlaybackStore((s) => s.setStep);
  const reset = useTimelinePlaybackStore((s) => s.reset);

  const matchesIncident = playbackIncidentId === incident.id;
  const currentStep = matchesIncident ? playbackStep : null;
  const isPlaying = matchesIncident && playing;
  const activeEvent =
    currentStep != null
      ? timeline[Math.min(currentStep, timeline.length - 1)]
      : null;

  useEffect(() => {
    reset();
  }, [incident.id, reset]);

  useEffect(() => {
    if (!isPlaying || currentStep == null || timeline.length === 0) return;
    const timer = window.setTimeout(() => {
      if (currentStep >= timeline.length - 1) {
        pause();
        return;
      }
      setStep(incident.id, currentStep + 1);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [currentStep, incident.id, isPlaying, pause, setStep, timeline.length]);

  if (timeline.length === 0) return null;

  const play = () => {
    if (isPlaying) {
      pause();
      return;
    }
    if (
      !matchesIncident ||
      currentStep == null ||
      currentStep >= timeline.length - 1
    ) {
      start(incident.id, 0);
      return;
    }
    start(incident.id, currentStep);
  };

  const move = (delta: number) => {
    const base = currentStep ?? (delta > 0 ? -1 : 0);
    const next = Math.max(0, Math.min(timeline.length - 1, base + delta));
    pause();
    setStep(incident.id, next);
  };

  return (
    <div className="rounded-lg border border-rose-500/35 bg-rose-950/15 px-3 py-2.5 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-300/90">
            Case replay
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-war-muted/90">
            Replays the curated disclosure trail in teaching order. The globe
            and this rail share the same milestone.
          </p>
        </div>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-war-muted">
          {currentStep == null
            ? `0/${timeline.length}`
            : `${currentStep + 1}/${timeline.length}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={play}
          className="border border-rose-400/45 bg-rose-950/35 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-rose-100 hover:bg-rose-900/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
        >
          {isPlaying
            ? "Pause"
            : currentStep == null || currentStep >= timeline.length - 1
              ? "Replay case"
              : "Resume"}
        </button>
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={currentStep == null || currentStep <= 0}
          className="border border-war-border bg-black/50 px-2.5 py-1.5 text-[10px] text-war-muted hover:text-war-white disabled:opacity-35"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={currentStep != null && currentStep >= timeline.length - 1}
          className="border border-war-border bg-black/50 px-2.5 py-1.5 text-[10px] text-war-muted hover:text-war-white disabled:opacity-35"
        >
          Next
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={currentStep == null}
          className="border border-war-border bg-black/50 px-2.5 py-1.5 text-[10px] text-war-muted hover:text-war-white disabled:opacity-35"
        >
          Clear
        </button>
      </div>

      <div
        className="flex items-center gap-1.5"
        aria-label="Timeline milestones"
      >
        {timeline.map((event, index) => {
          const active = currentStep === index;
          const passed = currentStep != null && index < currentStep;
          return (
            <button
              key={`${event.label}-${index}`}
              type="button"
              onClick={() => {
                pause();
                setStep(incident.id, index);
              }}
              title={`${event.dateLabel}: ${event.label}`}
              aria-label={`Jump to milestone ${index + 1}: ${event.label}`}
              className={`h-2.5 flex-1 border transition-all ${
                active
                  ? "border-rose-300 bg-rose-400"
                  : passed
                    ? "border-rose-700/70 bg-rose-900/70"
                    : "border-war-border bg-black/70 hover:border-rose-500/55"
              }`}
            />
          );
        })}
      </div>

      {activeEvent && (
        <div className="border-l-2 border-rose-400 bg-black/45 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose-300/80">
              {isPlaying ? "Playing" : "Focused milestone"}
            </span>
            <span className="text-[10px] text-war-muted">
              {activeEvent.dateLabel}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-war-white">
            {activeEvent.label}
          </p>
          {activeEvent.detail && (
            <p className="mt-1 text-[10px] leading-relaxed text-war-muted/90">
              {activeEvent.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

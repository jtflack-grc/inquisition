import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { IRIS_XTREME_2026 } from "../inquisition/irisXtremeResearch";
import { useIncidentStore } from "../store/incidentStore";
import { INQUISITION_OPEN_GUIDED_CASES_EVENT } from "./guidedInvestigationsNavigation";

/**
 * An optional, minimal first-run teaching path. This intentionally reveals
 * just one question at a time, without duplicating the application rails.
 */
const INTRO_VERSION = "4";
const DISMISS_KEY = `inquisition-intro-dismissed-v${INTRO_VERSION}`;
type IntroScreen = "intro" | "choose" | "lesson";
type LessonStage = 0 | 1 | 2;

export const INQUISITION_SHOW_INTRO_EVENT = "inquisition-show-intro";

function hasDismissedIntro(): boolean {
  try {
    return (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(DISMISS_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function markIntroDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
    localStorage.removeItem("inquisition-welcome-seen");
    localStorage.removeItem("impact-welcome-seen");
  } catch {
    // Private browsing can disable storage. The casebook is still accessible.
  }
}

const LESSON_STAGES = ["Source facts", "Challenge the model", "Make a decision"] as const;

export function WelcomePopup() {
  const incidents = useIncidentStore((state) => state.incidents);
  const setSelectedIncidentId = useIncidentStore(
    (state) => state.setSelectedIncidentId
  );
  const setIncidentQuery = useIncidentStore((state) => state.setIncidentQuery);
  const [isVisible, setIsVisible] = useState(false);
  const [screen, setScreen] = useState<IntroScreen>("intro");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [stage, setStage] = useState<LessonStage>(0);
  const [showFacilitatorNotes, setShowFacilitatorNotes] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasDismissedIntro()) return;
    const timer = window.setTimeout(() => {
      setScreen("intro");
      setIsVisible(true);
    }, 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const replay = () => {
      setScreen("intro");
      setSelectedExampleId(null);
      setStage(0);
      setIsVisible(true);
    };
    const guided = () => {
      setScreen("choose");
      setSelectedExampleId(null);
      setStage(0);
      setIsVisible(true);
    };
    window.addEventListener(INQUISITION_SHOW_INTRO_EVENT, replay);
    window.addEventListener(INQUISITION_OPEN_GUIDED_CASES_EVENT, guided);
    return () => {
      window.removeEventListener(INQUISITION_SHOW_INTRO_EVENT, replay);
      window.removeEventListener(INQUISITION_OPEN_GUIDED_CASES_EVENT, guided);
    };
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    markIntroDismissed();
  }, []);

  const beginExample = useCallback(
    (id: string) => {
      const exists = GOLDEN_EXAMPLES.some((example) => example.id === id);
      if (!exists || !incidents.some((incident) => incident.id === id)) return;
      setIncidentQuery("");
      setSelectedIncidentId(id);
      setSelectedExampleId(id);
      setStage(0);
      setShowFacilitatorNotes(false);
      setScreen("lesson");
    },
    [incidents, setIncidentQuery, setSelectedIncidentId]
  );

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, isVisible]);

  useLayoutEffect(() => {
    if (isVisible) primaryRef.current?.focus();
  }, [isVisible, screen, stage]);

  const example = GOLDEN_EXAMPLES.find((item) => item.id === selectedExampleId);
  const incident = incidents.find((item) => item.id === selectedExampleId);
  const firstSource = incident?.evidence.find(
    (item) => item.linkRole === "deep_link"
  ) ?? incident?.evidence[0];

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] grid place-items-center bg-[#020807]/95 p-3 sm:p-4"
      role="presentation"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="signal-frame relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto border border-emerald-400/25 bg-[#06100e] shadow-[0_32px_100px_rgba(0,0,0,.75)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center text-emerald-100/55 transition-colors hover:bg-emerald-300/10 hover:text-white"
          aria-label="Close introduction and open casebook"
        >
          <span aria-hidden="true" className="text-xl">×</span>
        </button>

        {screen === "intro" && (
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">
              INQUISITION / start here
            </p>
            <h1
              id="welcome-title"
              className="max-w-lg text-3xl font-medium leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl"
            >
              Interrogate the loss story.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
              {incidents.length} public cyber incidents, their source evidence,
              and an illustrative model you can challenge. There are two ways in.
            </p>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              <button
                ref={primaryRef}
                type="button"
                onClick={() => setScreen("choose")}
                className="min-h-28 border border-emerald-400/50 bg-emerald-300/[0.06] p-4 text-left transition-colors hover:bg-emerald-300/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-300/85">
                  Guided / three steps
                </span>
                <span className="mt-2 block text-base font-semibold text-white">
                  Start with one case →
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  Five handpicked examples. Evidence first, then assumptions,
                  then the decision. No fire hose.
                </span>
              </button>
              <button
                type="button"
                onClick={close}
                className="min-h-28 border border-slate-700 bg-[#0c1414] p-4 text-left transition-colors hover:border-emerald-300/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400">
                  Full casebook / 50 cases
                </span>
                <span className="mt-2 block text-base font-semibold text-white">
                  Explore independently →
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  Open the complete evidence library, loss model, notebook, and
                  interactive globe.
                </span>
              </button>
            </div>
            <p className="mt-5 text-[10px] leading-5 text-slate-500">
              Educational and retrospective. The loss model is illustrative,
              not a certified FAIR assessment. You can return to guided cases
              from the header at any time.
            </p>
          </div>
        )}

        {screen === "choose" && (
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300/70">
              Guided / choose your investigation
            </p>
            <h1
              id="welcome-title"
              className="max-w-lg text-2xl font-medium tracking-tight text-white sm:text-3xl"
            >
              One case. Three questions.
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
              Choose a case that interests you. Each investigation starts with
              source facts and finishes by challenging a decision—not with a
              made-up certainty score.
            </p>
            <div className="mt-5 space-y-1.5">
              {GOLDEN_EXAMPLES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  ref={index === 0 ? primaryRef : undefined}
                  onClick={() => beginExample(item.id)}
                  className="flex w-full items-start gap-3 border border-slate-700/75 bg-[#0b1513] px-3 py-3 text-left transition-colors hover:border-emerald-300/55 hover:bg-[#12221d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                >
                  <span className="pt-0.5 font-mono text-xs text-emerald-300/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">
                      {item.title.split(" / ")[1]?.split(" · ")[0] ?? item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-400">
                      {item.premise}
                    </span>
                  </span>
                  <span aria-hidden="true" className="ml-auto text-emerald-300/70">
                    →
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => setScreen("intro")}
                className="text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                ← Introduction
              </button>
              <button
                type="button"
                onClick={close}
                className="text-slate-400 underline-offset-4 hover:text-white hover:underline"
              >
                Skip to the full casebook
              </button>
            </div>
          </div>
        )}

        {screen === "lesson" && example && incident && (
          <div className="px-6 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">
              Guided investigation / {String(stage + 1).padStart(2, "0")} of 03
            </p>
            <div className="mb-4 grid grid-cols-3 gap-1" aria-label="Investigation progress">
              {LESSON_STAGES.map((label, index) => (
                <div
                  key={label}
                  className={`h-1 ${
                    index <= stage ? "bg-emerald-300/80" : "bg-slate-700"
                  }`}
                  aria-label={`${label}: ${index < stage ? "complete" : index === stage ? "current" : "upcoming"}`}
                />
              ))}
            </div>
            <h1
              id="welcome-title"
              className="text-xl font-medium leading-tight text-white sm:text-2xl"
            >
              {incident.company.name}
            </h1>
            <p className="mt-1 text-[11px] text-slate-400">
              {example.teachingPoint}
            </p>

            <div className="mt-5 border-l-2 border-emerald-300/50 bg-[#0b1714] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300/80">
                {LESSON_STAGES[stage]}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-white">
                {stage === 0
                  ? example.sourceQuestion
                  : stage === 1
                    ? example.modelQuestion
                    : example.decisionQuestion}
              </p>
            </div>

            {stage === 0 && (
              <div className="mt-4 space-y-2 text-xs leading-5 text-slate-300">
                <p>{incident.incidentSummary}</p>
                {firstSource && (
                  <p className="border-t border-slate-700/70 pt-3">
                    <span className="font-mono text-[9px] uppercase text-slate-500">
                      Examine a source /{" "}
                    </span>
                    <a
                      href={firstSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-200 underline underline-offset-2"
                    >
                      {firstSource.title} ↗
                    </a>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      A link is a starting point. Confirm the relevant passage;
                      a filing index is not itself proof of an incident fact.
                    </span>
                  </p>
                )}
              </div>
            )}

            {stage === 1 && (
              <div className="mt-4 space-y-2 text-xs leading-5 text-slate-300">
                <p>
                  INQUISITION separates an observed incident from a hypothetical
                  loss scenario. A model input is not a discovered fact.
                </p>
                <div className="border border-slate-700/70 p-3">
                  <p className="font-mono text-[9px] uppercase text-slate-500">
                    Case model defaults · assumptions, not observations
                  </p>
                  <p className="mt-1">
                    Downtime:{" "}
                    <strong className="text-white">
                      {incident.modelingDefaults?.downtimeDays == null
                        ? "Not supplied"
                        : `${incident.modelingDefaults.downtimeDays} days (illustrative)`}
                    </strong>
                    {" "}· Records:{" "}
                    <strong className="text-white">
                      {incident.modelingDefaults?.recordsMillions == null
                        ? "Not supplied"
                        : `${incident.modelingDefaults.recordsMillions}M (illustrative)`}
                    </strong>
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">
                    Missing inputs are not evidence of zero loss. The full model
                    exposes its categories, ranges and limitations separately.
                  </p>
                </div>
              </div>
            )}

            {stage === 2 && (
              <div className="mt-4 space-y-3 text-xs leading-5 text-slate-300">
                <p>
                  What would you investigate, test or change—and what evidence
                  would persuade you that the intervention works?
                </p>
                <button
                  type="button"
                  onClick={() => setShowFacilitatorNotes((previous) => !previous)}
                  className="border border-slate-700 px-3 py-2 text-[11px] text-emerald-200 transition-colors hover:border-emerald-400/60"
                >
                  {showFacilitatorNotes ? "Hide" : "Reveal"} teaching notes
                </button>
                {showFacilitatorNotes && (
                  <p className="border-l border-emerald-300/50 pl-3 text-slate-300">
                    {example.reveal}
                    <a
                      href={`${IRIS_XTREME_2026.sourceUrl}#page=${example.researchPage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-[10px] text-emerald-200 underline"
                    >
                      Compare external IRIS Xtreme research ↗
                    </a>
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-700/65 pt-4">
              <button
                ref={primaryRef}
                type="button"
                onClick={() => {
                  if (stage === 2) close();
                  else {
                    setShowFacilitatorNotes(false);
                    setStage((current) => (current + 1) as LessonStage);
                  }
                }}
                className="min-h-11 bg-emerald-300 px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.09em] text-[#02110c] hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              >
                {stage === 2 ? "Enter full investigation →" : "Next question →"}
              </button>
              {stage > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowFacilitatorNotes(false);
                    setStage((current) => (current - 1) as LessonStage);
                  }}
                  className="min-h-11 px-2 text-[11px] text-slate-300 hover:text-white"
                >
                  ← Previous
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="ml-auto min-h-11 text-[10px] text-slate-400 hover:text-white"
              >
                Skip to full casebook
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setScreen("choose");
                setShowFacilitatorNotes(false);
              }}
              className="mt-3 text-[10px] text-slate-500 underline-offset-4 hover:text-slate-200 hover:underline"
            >
              Choose a different investigation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

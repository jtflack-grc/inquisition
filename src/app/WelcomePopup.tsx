import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { useIncidentStore } from "../store/incidentStore";
import { INQUISITION_OPEN_GUIDED_CASES_EVENT } from "./guidedInvestigationsNavigation";

const INTRO_VERSION = "5";
const DISMISS_KEY = `inquisition-intro-dismissed-v${INTRO_VERSION}`;
type Screen = "intro" | "choose";

export const INQUISITION_SHOW_INTRO_EVENT = "inquisition-show-intro";

function hasDismissedIntro(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1";
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
    // A blocked localStorage does not prevent exploring the casebook.
  }
}

/**
 * The introduction is now a doorway, not a pseudo-tutorial.
 * The working three-step investigation lives in LiteWorkspace.
 */
export function WelcomePopup({ onEnterLite, onOpenFull }: { onEnterLite: (id: string) => void; onOpenFull: () => void }) {
  const incidentCount = useIncidentStore((state) => state.incidents.length);
  const [visible, setVisible] = useState(false);
  const [screen, setScreen] = useState<Screen>("intro");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasDismissedIntro()) return;
    const timer = window.setTimeout(() => { setScreen("intro"); setVisible(true); }, 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const showIntro = () => { setScreen("intro"); setVisible(true); };
    const showGuides = () => { setScreen("choose"); setVisible(true); };
    window.addEventListener(INQUISITION_SHOW_INTRO_EVENT, showIntro);
    window.addEventListener(INQUISITION_OPEN_GUIDED_CASES_EVENT, showGuides);
    return () => {
      window.removeEventListener(INQUISITION_SHOW_INTRO_EVENT, showIntro);
      window.removeEventListener(INQUISITION_OPEN_GUIDED_CASES_EVENT, showGuides);
    };
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    markIntroDismissed();
  }, []);

  const enterLite = (id: string) => {
    onEnterLite(id);
    close();
  };

  const enterFull = () => {
    onOpenFull();
    close();
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, close]);

  useLayoutEffect(() => { if (visible) firstRef.current?.focus(); }, [visible, screen]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] grid place-items-center bg-[#020807]/95 p-3 sm:p-4"
      role="presentation"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto border border-emerald-400/25 bg-[#08100f] shadow-[0_32px_100px_rgba(0,0,0,.75)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center text-slate-400 hover:text-white"
          aria-label="Close introduction"
        >
          <span aria-hidden="true" className="text-xl">×</span>
        </button>

        {screen === "intro" ? (
          <div className="px-6 pb-7 pt-9 sm:px-9 sm:pb-9">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/75">
              INQUISITION / start here
            </p>
            <h1 id="welcome-title" className="mt-4 text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">
              Interrogate the loss story.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
              {incidentCount} public cyber incidents, curated source material and assumptions
              you can challenge. Decide how deeply you want to begin.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                ref={firstRef}
                type="button"
                onClick={() => setScreen("choose")}
                className="min-h-36 border border-emerald-300/55 bg-[#11201a] p-4 text-left transition-colors hover:border-emerald-200 hover:bg-[#182c23]"
              >
                <span className="font-mono text-[9px] uppercase tracking-wide text-emerald-200">
                  Lite / five selected cases
                </span>
                <span className="mt-2 block text-base font-medium text-white">
                  Investigate one case →
                </span>
                <span className="mt-2 block text-[11px] leading-5 text-slate-300">
                  A working, simplified casebook. Explore evidence, move the model and test a decision.
                </span>
              </button>
              <button
                type="button"
                onClick={enterFull}
                className="min-h-36 border border-slate-700 bg-[#0b1214] p-4 text-left transition-colors hover:border-slate-400"
              >
                <span className="font-mono text-[9px] uppercase tracking-wide text-slate-400">
                  Full / {incidentCount} cases
                </span>
                <span className="mt-2 block text-base font-medium text-white">
                  Open the full casebook →
                </span>
                <span className="mt-2 block text-[11px] leading-5 text-slate-400">
                  The evidence library, FAIR assumptions, simulation, notebook and interactive globe.
                </span>
              </button>
            </div>
            <p className="mt-5 text-[10px] leading-5 text-slate-500">
              Both paths separate documented facts from hypothetical loss. Method and credits
              remain available from the header.
            </p>
          </div>
        ) : (
          <div className="px-6 pb-7 pt-9 sm:px-9 sm:pb-9">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/75">
              Lite / choose one of five
            </p>
            <h1 id="welcome-title" className="mt-3 text-2xl tracking-tight text-white sm:text-3xl">
              Which loss story will you investigate?
            </h1>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Each opens a smaller but functional workspace. Change a scenario, inspect the source
              and take your case into full INQUISITION when ready.
            </p>
            <div className="mt-5 space-y-2">
              {GOLDEN_EXAMPLES.map((item, index) => (
                <button
                  key={item.id}
                  ref={index === 0 ? firstRef : undefined}
                  type="button"
                  onClick={() => enterLite(item.id)}
                  className="flex w-full items-start gap-3 border border-slate-700/80 p-3 text-left transition-colors hover:border-emerald-300/55 hover:bg-[#11201a]"
                >
                  <span className="font-mono text-xs text-emerald-300/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-white">
                      {item.title.replace(/^\d{2} · /, "").split(" / ")[0]}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-slate-400">{item.premise}</span>
                  </span>
                  <span className="ml-auto text-emerald-200" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-5 text-[11px]">
              <button type="button" onClick={() => setScreen("intro")} className="text-slate-300 underline-offset-4 hover:underline">
                ← Back
              </button>
              <button type="button" onClick={enterFull} className="text-slate-400 underline-offset-4 hover:text-white hover:underline">
                Skip to full casebook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

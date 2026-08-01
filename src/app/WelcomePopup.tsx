import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const INTRO_VERSION = "3";
const DISMISS_KEY = `inquisition-intro-dismissed-v${INTRO_VERSION}`;

export const INQUISITION_SHOW_INTRO_EVENT = "inquisition-show-intro";

function hasDismissedIntro(): boolean {
  return (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(DISMISS_KEY) === "1"
  );
}

function markIntroDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
    localStorage.removeItem("inquisition-welcome-seen");
    localStorage.removeItem("impact-welcome-seen");
  } catch {
    // Private browsing can disable storage. The app remains usable.
  }
}

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasDismissedIntro()) return;
    const timer = window.setTimeout(() => setIsVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const show = () => setIsVisible(true);
    window.addEventListener(INQUISITION_SHOW_INTRO_EVENT, show);
    return () => window.removeEventListener(INQUISITION_SHOW_INTRO_EVENT, show);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    markIntroDismissed();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, isVisible]);

  useLayoutEffect(() => {
    if (isVisible) enterRef.current?.focus();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] grid place-items-center bg-[#020807]/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={close}
    >
      <div
        className="signal-frame relative w-full max-w-xl overflow-hidden border border-emerald-400/30 bg-[#06100e] shadow-[0_32px_100px_rgba(0,0,0,.75)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center text-emerald-100/55 transition hover:bg-emerald-300/10 hover:text-white"
          aria-label="Close introduction"
        >
          <span aria-hidden="true" className="text-xl">
            ×
          </span>
        </button>

        <div className="relative px-7 pb-7 pt-8 sm:px-10 sm:pb-9 sm:pt-10">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/70">
            Casebook 01 / Public cyber loss
          </p>
          <h1
            id="welcome-title"
            className="max-w-md text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl"
          >
            Interrogate the loss story.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
            Reconstruct 34 public incidents from cited evidence, challenge the
            loss assumptions, and watch the materiality range move.
          </p>

          <div className="mt-8 grid gap-px border border-emerald-400/15 bg-emerald-400/15 sm:grid-cols-3">
            {[
              "Choose a case",
              "Inspect the evidence",
              "Interrogate the range",
            ].map((label, index) => (
              <div key={label} className="bg-[#06100e] px-4 py-4">
                <span className="block font-mono text-[9px] text-emerald-400/60">
                  0{index + 1}
                </span>
                <span className="mt-1 block text-xs text-slate-100">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              ref={enterRef}
              type="button"
              onClick={close}
              className="inline-flex min-h-12 items-center justify-center bg-emerald-300 px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#02110c] transition hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            >
              Open the casebook →
            </button>
            <p className="text-[10px] leading-4 text-slate-500">
              A retrospective teaching model, not a legal determination or
              certified FAIR analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

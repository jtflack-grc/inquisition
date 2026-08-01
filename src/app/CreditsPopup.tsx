import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INQUISITION_SHOW_INTRO_EVENT } from "./WelcomePopup";

export const INQUISITION_OPEN_CREDITS_EVENT = "inquisition-open-credits";

export function CreditsPopup() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(INQUISITION_OPEN_CREDITS_EVENT, show);
    return () =>
      window.removeEventListener(INQUISITION_OPEN_CREDITS_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-10 border border-emerald-400/15 px-3 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 transition hover:border-emerald-300/40 hover:text-emerald-200"
      >
        Method
      </button>
      {createPortal(
        open ? (
          <div
            className="fixed inset-0 z-[9999] grid place-items-center bg-[#020807]/90 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="method-title"
            onClick={close}
          >
            <div
              className="signal-frame relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-emerald-400/25 bg-[#06100e] p-7 shadow-2xl sm:p-10"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-3 grid h-10 w-10 place-items-center text-xl text-slate-500 hover:text-white"
                aria-label="Close method panel"
              >
                ×
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-emerald-300/60">
                Method / boundaries
              </p>
              <h2
                id="method-title"
                className="mt-4 text-3xl font-medium tracking-[-0.035em] text-white"
              >
                Evidence before certainty.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                INQUISITION is a static, public casebook created by John Flack.
                It connects curated public artifacts to transparent loss ranges
                so assumptions can be inspected rather than hidden behind a
                single number.
              </p>

              <div className="mt-8 grid gap-6 border-y border-emerald-400/15 py-7 sm:grid-cols-2">
                <section>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">
                    Evidence
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Company filings, regulator material, litigation indexes, and
                    reporting are labeled by provenance. Links are starting
                    points; open and verify the underlying artifact.
                  </p>
                </section>
                <section>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">
                    Model
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Deterministic min / most likely / max category ranges feed
                    an optional Monte Carlo view. Buckets are sampled
                    independently; correlation and a complete FAIR factor tree
                    are outside scope.
                  </p>
                </section>
                <section>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">
                    FAIR
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    FAIR™ is a trademark of The FAIR Institute. This project
                    uses core FAIR concepts but is not affiliated with or
                    certified by The FAIR Institute.
                  </p>
                </section>
                <section>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">
                    Use
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Educational and retrospective only. Not legal, investment,
                    actuarial, insurance, or incident-response advice. Dollar
                    ranges are illustrative unless a cited filing says
                    otherwise.
                  </p>
                </section>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://www.fairinstitute.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center border border-emerald-400/25 px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200 hover:bg-emerald-300/10"
                >
                  FAIR Institute ↗
                </a>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    window.setTimeout(
                      () =>
                        window.dispatchEvent(
                          new CustomEvent(INQUISITION_SHOW_INTRO_EVENT)
                        ),
                      0
                    );
                  }}
                  className="inline-flex min-h-11 items-center justify-center border border-slate-700 px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 hover:text-white"
                >
                  Replay introduction
                </button>
              </div>
            </div>
          </div>
        ) : null,
        document.body
      )}
    </>
  );
}

import { lazy, Suspense, useState } from "react";
import { CreditsPopup, INQUISITION_OPEN_CREDITS_EVENT } from "./CreditsPopup";
import { IncidentIntelPanel } from "./IncidentIntelPanel";
import { MaterialityDashboard } from "./MaterialityDashboard";
import { WelcomePopup } from "./WelcomePopup";

const ScenarioGlobe = lazy(() =>
  import("./ScenarioGlobe").then((m) => ({ default: m.ScenarioGlobe }))
);

function GlobeLoadingFallback() {
  return (
    <div
      className="flex flex-1 min-h-[240px] items-center justify-center bg-black text-sm text-slate-300 px-4"
      role="status"
      aria-live="polite"
    >
      Loading globe…
    </div>
  );
}

export function Layout() {
  const [mobilePane, setMobilePane] = useState<"evidence" | "model">(
    "evidence"
  );

  return (
    <>
      <div className="app-shell relative flex h-screen flex-col overflow-hidden bg-[#020806] text-white">
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-emerald-400/15 bg-[#020806]/95 px-4 py-3 backdrop-blur-xl md:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="hidden h-8 w-px bg-emerald-300/40 sm:block"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-[0.24em] text-white md:text-xl">
                INQUISITION
              </h1>
              <p className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300/60 sm:block">
                The public cyber materiality casebook
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.8)]" />
            Evidence / assumptions / range
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs">
            <CreditsPopup />
          </div>
        </header>

        <nav
          className="relative z-10 grid shrink-0 grid-cols-2 border-b border-emerald-400/15 bg-[#020806] md:hidden"
          aria-label="Mobile workspace"
        >
          {(["evidence", "model"] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              onClick={() => setMobilePane(pane)}
              className={`min-h-11 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                mobilePane === pane
                  ? "bg-emerald-300 text-[#02110c]"
                  : "text-slate-500 hover:bg-emerald-300/10 hover:text-emerald-200"
              }`}
              aria-current={mobilePane === pane ? "page" : undefined}
            >
              {pane === "evidence" ? "Evidence" : "Loss model"}
            </button>
          ))}
        </nav>

        <main className="relative z-10 flex flex-1 flex-col overflow-hidden md:flex-row">
          <section
            className={`${mobilePane === "evidence" ? "flex" : "hidden"} min-h-0 w-full flex-1 flex-col border-r border-emerald-400/10 bg-[#030a08]/95 md:flex md:w-[350px] md:flex-none lg:w-[410px]`}
          >
            <IncidentIntelPanel />
          </section>

          <section
            className={`${mobilePane === "model" ? "block" : "hidden"} min-h-0 min-w-0 flex-1 overflow-y-auto border-r border-emerald-400/10 bg-[#06100e]/95 md:block md:min-w-[340px] md:max-w-[650px]`}
          >
            <MaterialityDashboard />
          </section>

          <section className="relative hidden min-h-0 min-w-0 flex-1 flex-col bg-[#020806]/95 md:flex md:min-w-[380px]">
            <Suspense fallback={<GlobeLoadingFallback />}>
              <div className="flex-1 min-h-0 flex flex-col">
                <ScenarioGlobe />
              </div>
            </Suspense>
          </section>
        </main>

        <footer className="relative z-10 shrink-0 border-t border-emerald-400/10 bg-[#020806] px-4 py-2 md:px-7">
          <p className="mx-auto max-w-7xl text-center font-mono text-[9px] leading-snug text-slate-600 md:text-left">
            Retrospective teaching model · Verify primary sources · Not legal,
            investment, actuarial, or insurance advice ·{" "}
            <button
              type="button"
              className="text-emerald-400/80 underline underline-offset-2 hover:text-emerald-300"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(INQUISITION_OPEN_CREDITS_EVENT)
                )
              }
            >
              Method &amp; credits
            </button>
          </p>
        </footer>
      </div>
      <WelcomePopup />
    </>
  );
}

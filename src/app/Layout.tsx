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
      className="flex flex-1 min-h-[240px] items-center justify-center bg-black px-4 text-xs text-slate-400"
      role="status"
      aria-live="polite"
    >
      Loading case map…
    </div>
  );
}

export function Layout() {
  const [mobilePane, setMobilePane] = useState<"evidence" | "model">(
    "evidence"
  );

  return (
    <>
      <div className="inquisition-shell relative flex h-screen flex-col overflow-hidden text-war-white">
        <header className="inquisition-topbar relative z-10 flex shrink-0 items-center justify-between border-b border-war-border px-4 py-3 md:px-6">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1 className="truncate text-xl font-semibold tracking-[0.14em] text-war-white md:text-2xl">
                INQUISITION
              </h1>
              <span className="hidden font-mono text-[10px] text-war-muted lg:inline">
                PUBLIC CYBER MATERIALITY CASEBOOK
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-war-muted">
              Evidence, assumptions, and loss range across 34 public incidents
            </p>
          </div>

          <div className="hidden items-center gap-4 text-[10px] text-war-muted xl:flex">
            <span>Evidence-led</span>
            <span className="h-3 w-px bg-war-border" aria-hidden="true" />
            <span>FAIR-informed</span>
            <span className="h-3 w-px bg-war-border" aria-hidden="true" />
            <span>Retrospective</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <CreditsPopup />
          </div>
        </header>

        <nav
          className="relative z-10 grid shrink-0 grid-cols-2 border-b border-war-border bg-[#0a0d10] md:hidden"
          aria-label="Mobile workspace"
        >
          {(["evidence", "model"] as const).map((pane) => (
            <button
              key={pane}
              type="button"
              onClick={() => setMobilePane(pane)}
              className={`min-h-11 border-b-2 text-xs font-medium transition-colors ${
                mobilePane === pane
                  ? "border-slate-200 text-war-white"
                  : "border-transparent text-war-muted hover:text-war-white"
              }`}
              aria-current={mobilePane === pane ? "page" : undefined}
            >
              {pane === "evidence" ? "Evidence" : "Loss model"}
            </button>
          ))}
        </nav>

        <main className="relative z-10 flex flex-1 flex-col overflow-hidden md:flex-row">
          <section
            className={`evidence-rail ${mobilePane === "evidence" ? "flex" : "hidden"} min-h-0 w-full flex-1 flex-col border-r border-war-border md:flex md:w-[360px] md:flex-none lg:w-[410px]`}
          >
            <IncidentIntelPanel />
          </section>

          <section
            className={`analysis-rail ${mobilePane === "model" ? "block" : "hidden"} min-h-0 min-w-0 flex-1 overflow-y-auto border-r border-war-border md:block md:min-w-[390px] md:max-w-[650px]`}
          >
            <MaterialityDashboard />
          </section>

          <section className="globe-rail relative hidden min-h-0 min-w-0 flex-1 flex-col bg-black md:flex md:min-w-[430px]">
            <Suspense fallback={<GlobeLoadingFallback />}>
              <div className="flex-1 min-h-0 flex flex-col">
                <ScenarioGlobe />
              </div>
            </Suspense>
          </section>
        </main>

        <footer className="relative z-10 shrink-0 border-t border-war-border bg-[#07090b] px-4 py-2 md:px-6">
          <p className="mx-auto max-w-7xl text-center text-[10px] leading-snug text-war-muted md:text-left">
            Retrospective teaching model · Verify primary sources · Not legal,
            investment, actuarial, or insurance advice ·{" "}
            <button
              type="button"
              className="text-slate-300 underline underline-offset-2 hover:text-white"
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

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { CreditsPopup, INQUISITION_OPEN_CREDITS_EVENT } from "./CreditsPopup";
import { IncidentIntelPanel } from "./IncidentIntelPanel";
import { CaseNotebook } from "./CaseNotebook";
import { NOTEBOOK_RAIL_EVENT } from "./notebookRailNavigation";
import type { NotebookRailDetail } from "./notebookRailNavigation";
import { resolveGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import { MaterialityDashboard } from "./MaterialityDashboard";
import { WelcomePopup } from "./WelcomePopup";
import { LiteWorkspace } from "./LiteWorkspace";
import type { Incident, MaterialityOverrides } from "../inquisition/types";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { INQUISITION_OPEN_GUIDED_CASES_EVENT } from "./guidedInvestigationsNavigation";

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
  const [mobilePane, setMobilePane] = useState<
    "evidence" | "model" | "notebook"
  >("evidence");
  const [liteActive, setLiteActive] = useState(false);
  const setSelectedIncidentId = useIncidentStore((state) => state.setSelectedIncidentId);
  const setIncidentQuery = useIncidentStore((state) => state.setIncidentQuery);
  const setMaterialityOverrides = useIncidentStore((state) => state.setMaterialityOverridesForIncident);
  const selected = useIncidentStore(selectSelectedIncident);
  const incidentCount = useIncidentStore((state) => state.incidents.length);
  const lesson = useMemo(
    () => (selected ? resolveGlobeSecurityLesson(selected) : null),
    [selected]
  );

  useEffect(() => {
    const followNotebook = (event: Event) => {
      const detail = (event as CustomEvent<NotebookRailDetail>).detail;
      if (detail?.rail === "evidence" || detail?.rail === "model") {
        setMobilePane(detail.rail);
      }
    };
    window.addEventListener(NOTEBOOK_RAIL_EVENT, followNotebook);
    return () =>
      window.removeEventListener(NOTEBOOK_RAIL_EVENT, followNotebook);
  }, []);

  const enterLite = (id: string) => {
    setIncidentQuery("");
    setSelectedIncidentId(id);
    setLiteActive(true);
  };
  const leaveLite = (incident: Incident, overrides?: MaterialityOverrides) => {
    setSelectedIncidentId(incident.id);
    setIncidentQuery("");
    // Explicit scenario transfer, not historical fact mutation.
    if (overrides) setMaterialityOverrides(incident.id, overrides);
    setMobilePane(overrides ? "model" : "evidence");
    setLiteActive(false);
  };

  return (
    <>
      <div className="inquisition-shell relative flex h-screen flex-col overflow-hidden text-war-white">
        <header className="inquisition-topbar relative z-10 flex shrink-0 items-center justify-between border-b border-war-border px-4 py-3 md:px-6">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <h1 className="truncate text-lg font-semibold tracking-[0.14em] text-war-white sm:text-xl md:text-2xl">
                INQUISITION
              </h1>
              <span className="hidden font-mono text-[10px] text-war-muted lg:inline">
                PUBLIC CYBER MATERIALITY CASEBOOK
              </span>
            </div>
            <p className="mt-0.5 hidden text-[11px] text-war-muted sm:block">
              {liteActive ? "Lite / a focused investigative workspace" : <>{incidentCount} curated public incidents · evidence, assumptions &amp; loss pathways</>}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent(INQUISITION_OPEN_GUIDED_CASES_EVENT)
                )
              }
              className="inline-flex min-h-10 items-center gap-2 border border-[#7ea4bf]/35 px-2.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-slate-200 transition-colors hover:border-[#7ea4bf]/80 hover:bg-[#132029] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7ea4bf] sm:px-3"
              aria-label={`Explore ${GOLDEN_EXAMPLES.length} guided case investigations`}
              title="Choose one of five functional Lite investigations"
            >
              <span className="hidden sm:inline">Guided cases</span>
              <span className="sm:hidden">Guided</span>
              <span className="border-l border-war-border/70 pl-2 text-[#a5c3d3]">
                {String(GOLDEN_EXAMPLES.length).padStart(2, "0")}
              </span>
            </button>
            <CreditsPopup />
          </div>
        </header>

        {liteActive ? (
          <LiteWorkspace onExit={leaveLite} />
        ) : (
          <>
        <nav
          className="relative z-10 grid shrink-0 grid-cols-3 border-b border-war-border bg-[#0a0d10] xl:hidden"
          aria-label="Mobile workspace"
        >
          {(["evidence", "model", "notebook"] as const).map((pane) => (
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
              {pane === "evidence"
                ? "Evidence"
                : pane === "model"
                  ? "Loss model"
                  : "Notebook"}
            </button>
          ))}
        </nav>

        <main className="relative z-10 flex flex-1 flex-col overflow-hidden xl:flex-row">
          <section
            className={`evidence-rail ${mobilePane === "evidence" ? "flex" : "hidden"} min-h-0 w-full flex-1 flex-col border-r border-war-border xl:flex xl:w-[410px] xl:flex-none`}
          >
            <IncidentIntelPanel />
          </section>

          <section
            className={`analysis-rail ${mobilePane === "model" ? "block" : "hidden"} min-h-0 min-w-0 flex-1 overflow-y-auto border-r border-war-border xl:block xl:min-w-[390px] xl:max-w-[650px]`}
          >
            <MaterialityDashboard />
          </section>

          <section
            className={
              mobilePane === "notebook"
                ? "mobile-notebook-rail flex min-h-0 flex-1 flex-col xl:hidden"
                : "hidden"
            }
            aria-label="Mobile case notebook"
          >
            {selected && lesson ? (
              <CaseNotebook
                incident={selected}
                lesson={lesson}
                size="expanded"
                showSizeControls={false}
                onSizeChange={() => {}}
                closeLabel="Evidence"
                onClose={() => setMobilePane("evidence")}
              />
            ) : (
              <p className="p-5 text-war-muted">
                Select an incident to open its notebook.
              </p>
            )}
          </section>

          <section className="globe-rail relative hidden min-h-0 min-w-0 flex-1 flex-col bg-black xl:flex xl:min-w-[430px]">
            <Suspense fallback={<GlobeLoadingFallback />}>
              <div className="flex-1 min-h-0 flex flex-col">
                <ScenarioGlobe />
              </div>
            </Suspense>
          </section>
        </main>
          </>
        )}

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
      <WelcomePopup onEnterLite={enterLite} onOpenFull={() => setLiteActive(false)} />
    </>
  );
}

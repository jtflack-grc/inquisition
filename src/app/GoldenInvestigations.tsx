import type { MaterialityViewTab } from "../inquisition/materialityViewTab";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { IRIS_XTREME_2026 } from "../inquisition/irisXtremeResearch";
import { GUIDED_CASES_DETAILS_ID } from "./guidedInvestigationsNavigation";

export function GoldenInvestigations({
  selectedId,
  onSelectCase,
  onNavigate,
}: {
  selectedId: string;
  onSelectCase: (id: string) => void;
  onNavigate: (tab: MaterialityViewTab) => void;
}) {
  const active = GOLDEN_EXAMPLES.find((example) => example.id === selectedId);
  return (
    <section className="border border-war-border/70 bg-[#0d1115] px-3 py-3">
      <details id={GUIDED_CASES_DETAILS_ID}>
        <summary className="flex cursor-pointer items-center justify-between gap-2 text-[11px] font-semibold text-war-white">
          <span>Five guided investigations · demo / teachables</span>
          <span className="font-mono text-[9px] font-normal text-[#a5c3d3]">
            Open teaching paths
          </span>
        </summary>
        <div className="mt-3 space-y-3">
          <p className="max-w-prose text-[10px] leading-relaxed text-war-muted">
            Each path deliberately separates source evidence, analyst
            assumptions and what would change the decision. Select a case and
            use the left evidence rail, then examine the model.
          </p>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {GOLDEN_EXAMPLES.map((example) => (
              <button
                type="button"
                key={example.id}
                onClick={() => {
                  onSelectCase(example.id);
                  onNavigate("basic");
                }}
                className={`border px-2.5 py-2 text-left text-[10px] transition-colors ${
                  example.id === selectedId
                    ? "border-[#7ea4bf] bg-[#18222b] text-war-white"
                    : "border-war-border/60 text-war-muted hover:border-[#7ea4bf]/60 hover:text-war-white"
                }`}
              >
                <span className="block font-semibold">{example.title}</span>
                <span className="mt-0.5 block text-[9px] leading-relaxed">
                  {example.premise}
                </span>
              </button>
            ))}
          </div>
          {active ? (
            <div className="border-t border-war-border/60 pt-3 text-[10px] leading-relaxed text-war-muted">
              <div className="font-semibold text-war-white">
                Current walkthrough · {active.teachingPoint}
              </div>
              <ol className="mt-2 space-y-2">
                <li>
                  <strong className="text-[#a5c3d3]">01 / Source facts</strong>{" "}
                  {active.sourceQuestion}
                </li>
                <li>
                  <strong className="text-[#a5c3d3]">02 / Model audit</strong>{" "}
                  {active.modelQuestion}
                </li>
                <li>
                  <strong className="text-[#a5c3d3]">03 / Decision</strong>{" "}
                  {active.decisionQuestion}
                </li>
              </ol>
              <button
                type="button"
                onClick={() => onNavigate(active.modelTab)}
                className="mt-3 border border-[#7ea4bf]/70 px-3 py-1.5 font-medium text-war-white"
              >
                Open{" "}
                {active.modelTab === "advanced" ? "Assumptions" : "Simulation"}{" "}
                →
              </button>
              <details className="mt-3 border-t border-war-border/60 pt-2">
                <summary className="cursor-pointer font-medium text-[#a5c3d3]">
                  Reveal facilitation notes after discussion
                </summary>
                <p className="mt-2">{active.reveal}</p>
                <p className="mt-1 text-[9px]">
                  <a
                    href={`${IRIS_XTREME_2026.sourceUrl}#page=${active.researchPage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#a5c3d3] underline"
                  >
                    Compare IRIS Xtreme research context
                  </a>
                  . These examples are independently curated, not verified
                  entries in Cyentia's undisclosed study cohort.
                </p>
              </details>
            </div>
          ) : (
            <p className="border-t border-war-border/60 pt-2 text-[10px] text-war-muted">
              Choose a guided case to reveal a question-led workshop.
            </p>
          )}
        </div>
      </details>
    </section>
  );
}

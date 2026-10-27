import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { computeMateriality } from "../inquisition/computeMateriality";
import type { Incident, MaterialityCategory } from "../inquisition/types";
import type { ResolvedGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import { useIncidentStore } from "../store/incidentStore";
import { navigateNotebookRail } from "./notebookRailNavigation";

export type NotebookTab = "case" | "mechanism" | "loss" | "controls";
export type NotebookSize = "compact" | "standard" | "expanded";

const VIEWS: { id: NotebookTab; label: string; question: string }[] = [
  {
    id: "case",
    label: "Case",
    question: "What happened, and what can we substantiate?",
  },
  {
    id: "mechanism",
    label: "Mechanism",
    question: "How did the event become possible?",
  },
  {
    id: "loss",
    label: "Loss pathways",
    question: "How might the event become financial loss?",
  },
  {
    id: "controls",
    label: "Controls",
    question: "Which intervention could change the outcome?",
  },
];

function money(value: number | undefined) {
  return value == null ? "Not available" : "$" + value.toLocaleString() + "M";
}

function categoryName(value: MaterialityCategory) {
  return value.replaceAll("_", " ");
}

function Disclosure({
  title,
  question,
  answer,
}: {
  title: string;
  question: string;
  answer: string;
}) {
  return (
    <details className="notebook-prompt">
      <summary>
        <span className="notebook-kicker">{title}</span>
        <span className="notebook-prompt__question">{question}</span>
        <span className="notebook-prompt__reveal">Explore reasoning +</span>
      </summary>
      <p className="notebook-prompt__answer">{answer}</p>
    </details>
  );
}

function SectionLabel({
  children,
  tag,
}: {
  children: ReactNode;
  tag?: string;
}) {
  return (
    <div className="notebook-section-label">
      <span>{children}</span>
      {tag && <span className="notebook-classification">{tag}</span>}
    </div>
  );
}

export function CaseNotebook({
  incident,
  lesson,
  onClose,
  size,
  onSizeChange,
}: {
  incident: Incident;
  lesson: ResolvedGlobeSecurityLesson;
  onClose: () => void;
  size: NotebookSize;
  onSizeChange: (size: NotebookSize) => void;
}) {
  const [tab, setTab] = useState<NotebookTab>("case");
  const scroller = useRef<HTMLDivElement | null>(null);
  const overrides = useIncidentStore(
    (s) => s.materialityOverridesByIncidentId[incident.id]
  );
  const estimates = useMemo(
    () => computeMateriality(incident, overrides).outputs.categories,
    [incident, overrides]
  );
  const primary = estimates.filter((item) => item.kind === "primary");
  const secondary = estimates.filter((item) => item.kind === "secondary");
  const leading = [...estimates].sort(
    (a, b) => b.rangeUSDm.mostLikely - a.rangeUSDm.mostLikely
  )[0];
  const fin = incident.company.financials;
  const activeView = VIEWS.find((view) => view.id === tab) ?? VIEWS[0];

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [incident.id, tab]);

  const toEvidence = (
    section:
      "intel-evidence" | "intel-limits" | "intel-timeline" = "intel-evidence"
  ) => {
    navigateNotebookRail({
      rail: "evidence",
      incidentId: incident.id,
      section,
    });
  };
  const toModel = (
    category?: MaterialityCategory,
    depth: "basic" | "advanced" | "fair_native" = "advanced"
  ) => {
    navigateNotebookRail({
      rail: "model",
      incidentId: incident.id,
      category,
      tab: depth,
    });
  };

  return (
    <section
      className="case-briefing case-notebook"
      data-size={size}
      aria-label="Incident case notebook"
    >
      <header className="notebook-header">
        <div className="notebook-header__identity">
          <div className="notebook-kicker">
            INQUISITION / INVESTIGATIVE DOSSIER
          </div>
          <h2>{incident.company.name}</h2>
          <p>{incident.incidentTitle}</p>
        </div>
        <div className="notebook-header__actions">
          <span className="notebook-header__size-label">DOCK</span>
          <div
            className="notebook-size-controls"
            role="group"
            aria-label="Dossier height"
          >
            {(["compact", "standard", "expanded"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => onSizeChange(option)}
                title={option + " dossier height"}
              >
                {option === "compact" ? "S" : option === "standard" ? "M" : "L"}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="notebook-map-button"
            onClick={onClose}
          >
            Map only <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>

      <nav className="notebook-tabs" aria-label="Investigative case views">
        {VIEWS.map((view) => (
          <button
            type="button"
            key={view.id}
            className={tab === view.id ? "notebook-tabs__active" : ""}
            onClick={() => setTab(view.id)}
            aria-current={tab === view.id ? "page" : undefined}
          >
            {view.label}
          </button>
        ))}
      </nav>

      <div className="notebook-scroll" ref={scroller}>
        <div className="notebook-deck">
          <span className="notebook-kicker">
            INVESTIGATIVE QUESTION /{" "}
            {String(VIEWS.indexOf(activeView) + 1).padStart(2, "0")}
          </span>
          <p>{activeView.question}</p>
        </div>

        {tab === "case" && (
          <div className="notebook-content">
            <section className="notebook-block">
              <SectionLabel tag="CURATED ACCOUNT">
                Incident summary
              </SectionLabel>
              <p className="notebook-body-copy">{incident.incidentSummary}</p>
              <div className="notebook-facts">
                <div>
                  <small>FIRST REPORTED</small>
                  <strong>{incident.firstReportedLabel}</strong>
                </div>
                <div>
                  <small>LAST UPDATED</small>
                  <strong>{incident.lastUpdatedLabel}</strong>
                </div>
                <div>
                  <small>LOCATION</small>
                  <strong>{incident.company.headquartersLabel}</strong>
                </div>
                <div>
                  <small>SECTOR / TYPE</small>
                  <strong>
                    {incident.company.sector ?? incident.company.type}
                  </strong>
                </div>
              </div>
              <p className="notebook-context">
                Curated incident narrative, not a verbatim statement of fact.
                Check the linked issuer and regulator records for each material
                claim.
              </p>
              <button
                className="notebook-link"
                type="button"
                onClick={() => toEvidence()}
              >
                Examine supporting evidence <span aria-hidden="true">↗</span>
              </button>
            </section>

            <section className="notebook-block">
              <SectionLabel
                tag={
                  fin?.isIllustrative
                    ? "ILLUSTRATIVE CONTEXT"
                    : "COMPANY CONTEXT"
                }
              >
                Financial snapshot
              </SectionLabel>
              <div className="notebook-metrics">
                <div>
                  <span>Revenue</span>
                  <strong>{money(fin?.revenueUSDm)}</strong>
                </div>
                <div>
                  <span>EBITDA</span>
                  <strong>{money(fin?.ebitdaUSDm)}</strong>
                </div>
                <div>
                  <span>Net income</span>
                  <strong>{money(fin?.netIncomeUSDm)}</strong>
                </div>
              </div>
              {fin?.fiscalYearLabel && (
                <p className="notebook-context">{fin.fiscalYearLabel}</p>
              )}
              {fin?.statementNote && (
                <p className="notebook-context">{fin.statementNote}</p>
              )}
              <p className="notebook-context">
                <strong>Not a breach-loss figure:</strong> company revenue and
                earnings supply scale; they do not establish cyber loss.
              </p>
              {fin?.filingUrl && (
                <a
                  className="notebook-link"
                  href={fin.filingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open cited financial filing ↗
                </a>
              )}
            </section>

            <section className="notebook-block">
              <SectionLabel tag="KNOWN LIMITS">
                Where the evidence stops
              </SectionLabel>
              {incident.limitations?.length ? (
                <ul className="notebook-list">
                  {incident.limitations.slice(0, 3).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="notebook-context">
                  No case-specific limitation notes supplied; absence of notes
                  is not evidence of completeness.
                </p>
              )}
              {incident.limitations && incident.limitations.length > 3 && (
                <button
                  type="button"
                  className="notebook-link"
                  onClick={() => toEvidence("intel-limits")}
                >
                  Read all caveats ↗
                </button>
              )}
              <p className="notebook-context">
                Evidence last reviewed: {incident.governance.lastVerified}.
              </p>
              <Disclosure
                title="ANALYST QUESTION"
                question="Which dated source substantiates the incident, and what remains unverified?"
                answer="Start with the strongest issuer or regulator document. Compare what it explicitly states with the curated summary. Missing dates, cost figures and attribution must remain unknown—not silently become model inputs."
              />
            </section>
          </div>
        )}

        {tab === "mechanism" && (
          <div className="notebook-content">
            <section className="notebook-block">
              <SectionLabel tag="CURATED TECHNICAL ACCOUNT">
                Attack mechanics
              </SectionLabel>
              <p className="notebook-body-copy">{lesson.attackMechanism}</p>
            </section>
            <section className="notebook-block">
              <SectionLabel tag="ANALYST INTERPRETATION">
                Enabling conditions and dependencies
              </SectionLabel>
              <p className="notebook-body-copy">{lesson.caseAnalysis}</p>
              <p className="notebook-context">
                This section interprets the case; it does not mean every causal
                link has been independently established by primary evidence.
              </p>
            </section>
            <section className="notebook-block">
              <SectionLabel tag="FAIR CONNECTION">
                From the mechanism to risk
              </SectionLabel>
              <div className="notebook-causal">
                <div>
                  <small>01 · EVENT</small>
                  <span>{incident.incidentTypeLabel}</span>
                </div>
                <div>
                  <small>02 · CONDITION</small>
                  <span>
                    Check the technical dependencies against the evidence
                    record.
                  </span>
                </div>
                <div>
                  <small>03 · LOSS</small>
                  <span>
                    Ask whether the condition could affect how often an event
                    occurs, how large the loss becomes, or both.
                  </span>
                </div>
                <div>
                  <small>04 · INTERVENTION</small>
                  <span>
                    Identify an observable control result before assuming risk
                    reduction.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="notebook-link"
                onClick={() => toEvidence()}
              >
                Test the mechanism against evidence ↗
              </button>
              <Disclosure
                title="ANALYST QUESTION"
                question={
                  "For " +
                  incident.company.name +
                  ", which step is documented and which step is inferred?"
                }
                answer="A mechanism described in a case study may combine public statements, technical interpretation and scenarios. Separate those before attributing control failure or assigning probabilities. Evidence of a control's existence is not evidence that it worked."
              />
            </section>
          </div>
        )}

        {tab === "loss" && (
          <div className="notebook-content">
            <section className="notebook-block">
              <SectionLabel tag="MODELED SCENARIOS · USD MILLIONS">
                Loss pathways
              </SectionLabel>
              <p className="notebook-context">
                These are illustrative FAIR-informed ranges from the shared
                model, reflecting current case overrides. They are not
                documented losses, probability estimates or measured confidence
                intervals.
              </p>
              {(
                [
                  { name: "Primary · event and response", rows: primary },
                  { name: "Secondary · external reactions", rows: secondary },
                ] as const
              ).map((group) => (
                <div className="notebook-loss-group" key={group.name}>
                  <h3>{group.name}</h3>
                  {group.rows.map((estimate) => (
                    <div className="notebook-loss-row" key={estimate.category}>
                      <div>
                        <strong>{categoryName(estimate.category)}</strong>
                        <small>LOW / MODE / HIGH · $M</small>
                      </div>
                      <div className="notebook-loss-row__values">
                        <span>{estimate.rangeUSDm.min.toFixed(1)}</span>
                        <strong>
                          {estimate.rangeUSDm.mostLikely.toFixed(1)}
                        </strong>
                        <span>{estimate.rangeUSDm.max.toFixed(1)}</span>
                      </div>
                      <button
                        type="button"
                        className="notebook-link"
                        onClick={() => toModel(estimate.category)}
                      >
                        Challenge assumptions ↗
                      </button>
                    </div>
                  ))}
                </div>
              ))}
              <p className="notebook-context">
                The model's frequency treatment and simulation are separate from
                these conditional loss-magnitude ranges. Do not multiply by an
                unstated event frequency.
              </p>
              <button
                type="button"
                className="notebook-link"
                onClick={() => toModel(undefined, "fair_native")}
              >
                Open FAIR-informed simulation ↗
              </button>
            </section>
            <section className="notebook-block">
              <SectionLabel tag="UNCERTAINTY">
                What could change the result?
              </SectionLabel>
              <p className="notebook-body-copy">
                {leading
                  ? "The largest current modeled category is " +
                    categoryName(leading.category) +
                    ". That ranking is an output of the chosen assumptions, not an observed ordering of incident costs."
                  : "No loss categories are available for this case."}
              </p>
              <Disclosure
                title="ANALYST QUESTION"
                question={
                  leading
                    ? "What additional evidence would justify changing the " +
                      categoryName(leading.category) +
                      " range?"
                    : "Which independent data could constrain these assumptions?"
                }
                answer="Look for cost line items, timing, scope, contractual obligations and external reactions that map to this particular loss category. Revise the assumption only when the supporting evidence is appropriate. Never convert headline revenue or record counts directly into a known loss."
              />
            </section>
          </div>
        )}

        {tab === "controls" && (
          <div className="notebook-content">
            <section className="notebook-block">
              <SectionLabel tag="CONTROL HYPOTHESES">
                Detection and prevention
              </SectionLabel>
              <p className="notebook-context">
                The items below are curated recommendations and
                taxonomy-informed teaching prompts, not confirmed controls in
                place at the victim organization.
              </p>
              <div className="notebook-control-group">
                <h3>Identify and detect</h3>
                <ul className="notebook-list">
                  {lesson.identification.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="notebook-control-group">
                <h3>Prevent and harden</h3>
                <ul className="notebook-list">
                  {lesson.prevention.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
              {lesson.mergedTaxonomyHints && (
                <p className="notebook-context">
                  Some recommendations are derived from the incident's taxonomy
                  tags, rather than incident-specific reporting.
                </p>
              )}
            </section>
            <section className="notebook-block">
              <SectionLabel tag="PRIORITIES">
                Response and resilience
              </SectionLabel>
              <ol className="notebook-list notebook-list--numbered">
                {lesson.mitigationPriority.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ol>
            </section>
            <section className="notebook-block">
              <SectionLabel tag="FAIR CONNECTION">
                Which lever could move?
              </SectionLabel>
              <div className="notebook-causal">
                <div>
                  <small>FREQUENCY</small>
                  <span>
                    Prevention and effective detection might reduce the
                    likelihood of successful loss events.
                  </span>
                </div>
                <div>
                  <small>MAGNITUDE</small>
                  <span>
                    Containment, recovery and contractual response might change
                    the cost once an event occurs.
                  </span>
                </div>
                <div>
                  <small>EVIDENCE</small>
                  <span>
                    Check telemetry, tests and actual recovery outcomes before
                    crediting effectiveness.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="notebook-link"
                onClick={() => toModel(undefined, "advanced")}
              >
                Inspect model assumptions ↗
              </button>
              <Disclosure
                title="ANALYST QUESTION"
                question={
                  "For " +
                  incident.company.name +
                  ", which proposal would change event frequency versus loss magnitude?"
                }
                answer="Form a testable hypothesis, identify a measurable result, and gather evidence of operating effectiveness. A listed control or successful installation does not establish a numerical reduction in future loss."
              />
            </section>
          </div>
        )}
      </div>
      <footer className="notebook-footer">
        <span>PUBLIC CASEBOOK · CURATED / MODELED CONTENT LABELED</span>
        <span>{incident.evidence.length} source links in evidence rail</span>
      </footer>
    </section>
  );
}

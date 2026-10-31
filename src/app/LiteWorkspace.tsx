import { useMemo, useState } from "react";
import { GOLDEN_EXAMPLES } from "../inquisition/goldenExamples";
import { IRIS_XTREME_2026 } from "../inquisition/irisXtremeResearch";
import {
  LITE_DECISION_OPTIONS,
  LITE_DIRECT_THEFT_EXAMPLE_USDM,
  LITE_REVENUE_USDM,
  calculateLiteScenario,
  clampLiteInputs,
  defaultLiteInputs,
  isDirectTheftExample,
  liteCounterfactual,
  liteOverrides,
  type LiteDecisionId,
  type LiteInputs,
} from "../inquisition/liteScenario";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import type { Incident } from "../inquisition/types";

type LiteStep = 0 | 1 | 2;
const STEP_LABELS = ["Investigate", "Model", "Decide"] as const;

function usd(millions: number): string {
  if (!Number.isFinite(millions)) return "—";
  return `$${millions.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M`;
}

function StepMarker({ n, step }: { n: LiteStep; step: LiteStep }) {
  return (
    <span
      className={`flex items-center gap-2 border-b-2 py-3 text-[11px] font-medium ${
        n === step
          ? "border-emerald-300 text-white"
          : n < step
            ? "border-emerald-700 text-emerald-200"
            : "border-transparent text-slate-500"
      }`}
    >
      <span className="font-mono text-[10px]">
        {String(n + 1).padStart(2, "0")}
      </span>
      {STEP_LABELS[n]}
    </span>
  );
}

function SliderField({
  id,
  title,
  description,
  value,
  max,
  step,
  onChange,
  unit,
}: {
  id: string;
  title: string;
  description: string;
  value: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit: string;
}) {
  return (
    <label
      htmlFor={id}
      className="block border-b border-slate-800 py-4 last:border-0"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-100">{title}</span>
        <strong className="font-mono text-sm tabular-nums text-emerald-200">
          {value.toLocaleString("en-US", { maximumFractionDigits: 1 })} {unit}
        </strong>
      </span>
      <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">
        {description}
      </span>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 block w-full accent-emerald-300"
      />
      <span className="mt-1 flex justify-between font-mono text-[9px] text-slate-500">
        <span>0</span>
        <span>
          {max} {unit}
        </span>
      </span>
    </label>
  );
}

function MaterialitySketch({
  incident,
  inputs,
}: {
  incident: Incident;
  inputs: LiteInputs;
}) {
  const value = calculateLiteScenario(incident, inputs);
  if (value.outputs === null) {
    return (
      <section className="border border-[#45515b] bg-[#0b1013] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#a5c3d3]">
          Direct asset theft · separate arithmetic
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-slate-400">
              FBI-reported gross theft
            </p>
            <p className="mt-1 text-xl font-semibold text-white">
              {usd(LITE_DIRECT_THEFT_EXAMPLE_USDM)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400">
              What-if unrecovered assets
            </p>
            <p
              aria-live="polite"
              className="mt-1 text-xl font-semibold text-emerald-200"
            >
              {usd(value.unrecoveredAssetExposureUSDm ?? 0)}
            </p>
          </div>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden bg-slate-700/70"
          aria-hidden="true"
        >
          <div
            className="h-full bg-[#84a8ba]"
            style={{ width: `${100 - inputs.recoveredTheftPct}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-amber-200/85">
          Gross theft is reported evidence. Recovery percentage is entirely
          hypothetical. This is not a filed retained loss, and the full model
          has no direct-asset-theft category. We do not quietly reinterpret
          theft as ransom or breach response costs.
        </p>
      </section>
    );
  }
  const primary = value.outputs.primaryTotalUSDm;
  const categories = value.outputs.categories.filter(
    (c) => c.kind === "primary"
  );
  const max = Math.max(1, ...categories.map((c) => c.rangeUSDm.mostLikely));
  const labels: Record<string, string> = {
    information_privacy: "Privacy / notification proxy",
    business_interruption: "Lost contribution proxy",
    network_security: "Response / remediation proxy",
    cyber_extortion: "Extortion input",
  };
  return (
    <section className="border border-[#45515b] bg-[#0b1013] p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#a5c3d3]">
        Shared INQUISITION model · synthetic organization
      </p>
      <p className="mt-1 text-[10px] text-slate-400">
        Primary-loss illustration for a fictional {usd(LITE_REVENUE_USDM)}
        -revenue organization, using a 15% EBITDA/revenue margin proxy. Not the
        named incident's reported loss.
      </p>
      <div className="mt-4 flex flex-wrap items-baseline gap-4">
        <div>
          <p className="text-[10px] text-slate-400">
            Modeled most-likely primary loss
          </p>
          <p
            aria-live="polite"
            className="mt-1 text-3xl font-medium tabular-nums text-emerald-200"
          >
            {usd(primary.mostLikely)}
          </p>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          illustrative min–max: {usd(primary.min)} – {usd(primary.max)}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {categories
          .filter((item) => item.rangeUSDm.mostLikely > 0)
          .map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-300">
                  {labels[item.category] ?? item.category}
                </span>
                <span className="font-mono tabular-nums text-white">
                  {usd(item.rangeUSDm.mostLikely)}
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden bg-slate-700/50"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-[#729b8a] transition-[width] duration-150"
                  style={{
                    width: `${100 * (item.rangeUSDm.mostLikely / max)}%`,
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      <p className="mt-4 border-t border-slate-800 pt-3 text-[10px] leading-relaxed text-slate-400">
        The ranges are formula-based teaching estimates, not statistical
        confidence intervals. Conditional external-party losses and annual event
        frequency are outside this Lite comparison. The record-count factor
        illustrates notification costs,{" "}
        <strong>not total-loss prediction</strong>.
      </p>
    </section>
  );
}

export function LiteWorkspace({
  onExit,
}: {
  onExit: (
    incident: Incident,
    overrides?: ReturnType<typeof liteOverrides>
  ) => void;
}) {
  const selected = useIncidentStore(selectSelectedIncident);
  const setSelectedId = useIncidentStore(
    (state) => state.setSelectedIncidentId
  );
  const clearQuery = useIncidentStore((state) => state.setIncidentQuery);
  const [step, setStep] = useState<LiteStep>(0);
  const [inputsById, setInputsById] = useState<Record<string, LiteInputs>>({});
  const [decision, setDecision] = useState<LiteDecisionId>("evidence");
  const [showNotes, setShowNotes] = useState(false);
  const [applied, setApplied] = useState(false);

  const example = GOLDEN_EXAMPLES.find((item) => item.id === selected?.id);
  const incident = example ? selected : null;
  const current = incident
    ? (inputsById[incident.id] ?? defaultLiteInputs(incident))
    : null;
  const theft = incident ? isDirectTheftExample(incident) : false;
  const alternative = useMemo(
    () => (current ? liteCounterfactual(current, decision, theft) : null),
    [current, decision, theft]
  );

  if (!incident || !example || !current || !alternative) {
    return (
      <div className="p-8 text-slate-300">
        Select one of the five guided cases to begin.
      </div>
    );
  }

  const setField = (patch: Partial<LiteInputs>) => {
    setInputsById((prior) => ({
      ...prior,
      [incident.id]: clampLiteInputs({
        ...(prior[incident.id] ?? defaultLiteInputs(incident)),
        ...patch,
      }),
    }));
    setApplied(false);
  };

  const goCase = (id: string) => {
    clearQuery("");
    setSelectedId(id);
    setStep(0);
    setDecision("evidence");
    setShowNotes(false);
    setApplied(false);
  };

  const handOff = () => {
    // Direct asset theft cannot be smuggled into a nonexistent LM category.
    // Other Lite assumptions transfer explicitly as overrides, not "source facts".
    onExit(incident, theft ? undefined : liteOverrides(current));
  };

  const currentValue = calculateLiteScenario(incident, current);
  const changedValue = calculateLiteScenario(incident, alternative);
  const originalAmount =
    currentValue.outputs?.primaryTotalUSDm.mostLikely ??
    currentValue.unrecoveredAssetExposureUSDm ??
    0;
  const revisedAmount =
    changedValue.outputs?.primaryTotalUSDm.mostLikely ??
    changedValue.unrecoveredAssetExposureUSDm ??
    0;
  const difference = Math.max(0, originalAmount - revisedAmount);
  const sources = [...incident.evidence]
    .sort(
      (a, b) =>
        Number(b.linkRole === "deep_link") - Number(a.linkRole === "deep_link")
    )
    .slice(0, 3);

  return (
    <main
      className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-[#07090b]"
      aria-label="INQUISITION Lite interactive workspace"
    >
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-8 sm:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#35413d] pb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/75">
              INQUISITION / LITE
            </p>
            <h1 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-white sm:text-3xl">
              One case. A defensible decision.
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
              Work with real incident sources and an explicitly hypothetical
              loss scenario. Only three essentials are visible at a time.
            </p>
          </div>
          <button
            type="button"
            onClick={handOff}
            className="min-h-11 border border-slate-600 px-4 font-mono text-[10px] uppercase tracking-wide text-slate-200 hover:border-emerald-300/65"
          >
            Full casebook →
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">
            Choose one of five investigations
          </p>
          <div
            className="flex gap-1.5 overflow-x-auto pb-2"
            role="group"
            aria-label="Guided incident cases"
          >
            {GOLDEN_EXAMPLES.map((item) => {
              const active = incident.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => goCase(item.id)}
                  className={`min-h-11 shrink-0 border px-3 text-left text-[11px] transition-colors ${
                    active
                      ? "border-emerald-300/80 bg-[#10211b] text-white"
                      : "border-slate-700 text-slate-400 hover:border-slate-400 hover:text-white"
                  }`}
                >
                  {item.title.replace(/^\d{2} · /, "").split(" / ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-6 border border-[#2b3936] bg-[#0c1112]">
          <div className="border-b border-slate-800 px-5 py-5 sm:px-7">
            <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-300/70">
              Case{" "}
              {String(
                GOLDEN_EXAMPLES.findIndex((g) => g.id === incident.id) + 1
              ).padStart(2, "0")}{" "}
              / 05
            </p>
            <h2 className="mt-2 text-xl font-medium text-white">
              {incident.company.name}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              {example.premise}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {example.teachingPoint}
            </p>
          </div>

          <nav
            className="grid grid-cols-3 gap-4 border-b border-slate-800 px-5 sm:px-7"
            aria-label="Lite investigation stages"
          >
            {([0, 1, 2] as const).map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStep(index)}
                aria-current={index === step ? "step" : undefined}
              >
                <StepMarker n={index} step={step} />
              </button>
            ))}
          </nav>

          <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,.85fr)]">
            {step === 0 && (
              <>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-300/70">
                    01 / Source facts
                  </p>
                  <h3 className="mt-2 text-xl text-white">
                    What do we actually know?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {incident.incidentSummary}
                  </p>
                  <p className="mt-5 border-l-2 border-[#668b91] pl-3 text-xs leading-5 text-slate-300">
                    {example.sourceQuestion}
                  </p>
                  <div className="mt-5">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      Open the supporting artifacts
                    </p>
                    {sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-start justify-between gap-3 border border-slate-700/70 p-3 text-xs leading-5 text-emerald-200 hover:border-emerald-300/50"
                      >
                        <span>
                          {source.title}
                          <span className="mt-1 block text-[10px] text-slate-400">
                            {source.linkRole === "navigation_hub"
                              ? "Navigation index: locate the exact artifact before citing."
                              : "Source link: verify the relevant passage."}
                          </span>
                        </span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
                <aside className="self-start border border-slate-700/65 bg-[#0a0e11] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    What the record cannot settle
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-5 text-slate-300">
                    {(
                      incident.limitations?.slice(0, 3) ?? [
                        "Public disclosure does not establish annual attack frequency.",
                        "A headline does not prove the financial loss borne by one party.",
                      ]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                    Source facts aren't model inputs until their provenance,
                    scope and timing agree.
                  </p>
                </aside>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-300/70">
                    02 / Model lab
                  </p>
                  <h3 className="mt-2 text-xl text-white">
                    Change the assumptions.
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {example.modelQuestion}
                  </p>
                  {theft ? (
                    <SliderField
                      id="lite-recovery"
                      title="Hypothetical asset recovery"
                      description="Try a different recovery assumption. The FBI's theft figure is not reduced by a reported, known recovery percentage here."
                      value={current.recoveredTheftPct}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(value) =>
                        setField({ recoveredTheftPct: value })
                      }
                    />
                  ) : (
                    <>
                      <SliderField
                        id="lite-outage"
                        title="Service interruption"
                        description="Change the hypothetical downtime days. This affects modeled lost contribution, not the incident's observed duration."
                        value={current.downtimeDays}
                        max={30}
                        step={1}
                        unit="days"
                        onChange={(value) => setField({ downtimeDays: value })}
                      />
                      <SliderField
                        id="lite-records"
                        title="Records in scope"
                        description="Changes the model's illustrative privacy response component, not the overall historical loss."
                        value={current.recordsMillions}
                        max={50}
                        step={0.5}
                        unit="million"
                        onChange={(value) =>
                          setField({ recordsMillions: value })
                        }
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInputsById((prev) => ({
                        ...prev,
                        [incident.id]: defaultLiteInputs(incident),
                      }));
                      setApplied(false);
                    }}
                    className="mt-2 text-[11px] text-slate-400 underline underline-offset-4 hover:text-white"
                  >
                    Reset this exercise
                  </button>
                </div>
                <MaterialitySketch incident={incident} inputs={current} />
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-300/70">
                    03 / Decision desk
                  </p>
                  <h3 className="mt-2 text-xl text-white">
                    What would change your decision?
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    {example.decisionQuestion}
                  </p>
                  <p className="mt-5 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    Select one testable hypothesis
                  </p>
                  <div className="mt-2 space-y-2">
                    {LITE_DECISION_OPTIONS.map((option) => {
                      const disabled = theft && option.id === "records";
                      const title =
                        theft && option.id === "recovery"
                          ? "Test a 25-point recovery assumption"
                          : option.title;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={disabled}
                          aria-pressed={decision === option.id}
                          onClick={() => {
                            setDecision(option.id);
                            setApplied(false);
                          }}
                          className={`block w-full border p-3 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                            decision === option.id
                              ? "border-emerald-300/70 bg-[#10211b]"
                              : "border-slate-700 hover:border-slate-500"
                          }`}
                        >
                          <span className="block font-medium text-white">
                            {title}
                          </span>
                          <span className="mt-1 block text-[10px] leading-5 text-slate-400">
                            {theft && option.id === "recovery"
                              ? "A purely hypothetical +25 percentage points recovered; not a prediction or modeled FAIR factor."
                              : option.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <aside className="self-start border border-[#45515b] bg-[#0b1013] p-4">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#a5c3d3]">
                    Counterfactual / not a forecast
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500">
                        Current illustration
                      </p>
                      <p className="mt-1 text-lg font-medium text-white">
                        {usd(originalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">
                        Under the what-if
                      </p>
                      <p className="mt-1 text-lg font-medium text-emerald-200">
                        {usd(revisedAmount)}
                      </p>
                    </div>
                  </div>
                  <p
                    aria-live="polite"
                    className="mt-3 text-xs leading-5 text-slate-300"
                  >
                    {decision === "evidence"
                      ? "No model assumption has changed. The next task is to obtain evidence that could justify one."
                      : difference === 0
                        ? "This lever does not change the current illustration. Check whether the selected loss pathway is actually in the model."
                        : `The illustrative difference is ${usd(difference)}. That result is conditional on the assumption, not evidence that a control delivers it.`}
                  </p>
                  {decision !== "evidence" && difference > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputsById((prev) => ({
                          ...prev,
                          [incident.id]: alternative,
                        }));
                        setApplied(true);
                        setStep(1);
                      }}
                      className="mt-4 min-h-11 border border-emerald-300/60 px-3 text-[11px] text-emerald-200 hover:bg-[#12221c]"
                    >
                      Apply hypothetical change in model lab →
                    </button>
                  )}
                  {applied && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      Hypothetical change applied to this Lite scenario.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNotes((open) => !open)}
                    aria-expanded={showNotes}
                    className="mt-5 block text-[11px] text-emerald-200 underline underline-offset-4"
                  >
                    {showNotes ? "Hide" : "Reveal"} facilitation notes
                  </button>
                  {showNotes && (
                    <div className="mt-3 border-t border-slate-700 pt-3">
                      <p className="text-xs leading-5 text-slate-300">
                        {example.reveal}
                      </p>
                      <a
                        href={`${IRIS_XTREME_2026.sourceUrl}#page=${example.researchPage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[10px] text-[#a5c3d3] underline"
                      >
                        Examine IRIS Xtreme comparative context ↗
                      </a>
                    </div>
                  )}
                  <p className="mt-5 border-t border-slate-800 pt-3 text-[10px] leading-5 text-slate-500">
                    To claim actual control effectiveness you would need a
                    measured recovery test, logged observation or credible
                    comparable study—not this slider.
                  </p>
                </aside>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 px-5 py-4 sm:px-7">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as LiteStep)}
                className="min-h-11 border border-slate-700 px-4 text-xs text-slate-300 hover:border-slate-400"
              >
                ← Previous
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as LiteStep)}
                className="min-h-11 bg-emerald-300 px-5 text-xs font-medium text-[#06110c] hover:bg-emerald-200"
              >
                Next: {STEP_LABELS[(step + 1) as LiteStep]} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handOff}
                className="min-h-11 bg-emerald-300 px-5 text-xs font-medium text-[#06110c] hover:bg-emerald-200"
              >
                Take this case into full INQUISITION →
              </button>
            )}
            <span className="ml-auto text-[10px] text-slate-500">
              {step + 1} / 3 · choose any step
            </span>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap justify-between gap-3 text-[10px] leading-5 text-slate-500">
          <p className="max-w-2xl">
            Lite reuses the full loss model for non-theft examples. It is a
            scenario learning tool, not an estimate of the real incident's
            financial damages. Historical facts, assumed inputs and
            counterfactuals remain separate.
          </p>
          <button
            type="button"
            onClick={handOff}
            className="text-slate-300 underline underline-offset-4 hover:text-white"
          >
            Open all 50 cases →
          </button>
        </div>
      </div>
    </main>
  );
}

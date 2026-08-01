import { useEffect, useMemo, useState } from "react";
import { computeMateriality } from "../inquisition/computeMateriality";
import {
  buildMaterialityExportPayload,
  insuranceOffsetUSDmFromInputs,
} from "../inquisition/materialityExportPayload";
import type { MaterialityViewTab } from "../inquisition/materialityViewTab";
import { scaleMaterialityOutputs } from "../inquisition/materialityScale";
import type {
  CategoryEstimate,
  Incident,
  MaterialityCategory,
  MaterialityInputs,
  MaterialityOverrides,
} from "../inquisition/types";
import {
  sectorPresetLabel,
  sectorPresetOverrides,
  type SectorPresetId,
} from "../inquisition/sectorPresets";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import { EduTooltip } from "./EduTooltip";
import { FairMethodologyDeepDive } from "./FairMethodologyDeepDive";
import { FairNativeMaterialityPanel } from "./FairNativeMaterialityPanel";
import { ModelLimitsStrip } from "./ModelLimitsStrip";

export type MaterialityTab = MaterialityViewTab;

function formatRangeM(r: {
  min: number;
  mostLikely: number;
  max: number;
}): string {
  return `$${r.min.toFixed(1)}M · $${r.mostLikely.toFixed(1)}M · $${r.max.toFixed(1)}M`;
}

function categoryLabel(c: MaterialityCategory): string {
  switch (c) {
    case "information_privacy":
      return "Information privacy";
    case "business_interruption":
      return "Business interruption";
    case "cyber_extortion":
      return "Cyber extortion";
    case "network_security":
      return "Network security & response";
    case "reputational_damage":
      return "External reaction (secondary)";
    default:
      return c;
  }
}

function kindLabel(k: "primary" | "secondary"): string {
  return k === "primary" ? "Primary" : "Secondary";
}

function basicCategoryLabel(c: MaterialityCategory): string {
  switch (c) {
    case "information_privacy":
      return "Privacy & breach response";
    case "business_interruption":
      return "Downtime & lost revenue";
    case "cyber_extortion":
      return "Extortion (if any)";
    case "network_security":
      return "Security & cleanup costs";
    case "reputational_damage":
      return "External reaction (conditional)";
    default:
      return c;
  }
}

function fairNativeCategoryLabel(c: MaterialityCategory): string {
  switch (c) {
    case "information_privacy":
      return "LM (primary): data / privacy & response proxy";
    case "business_interruption":
      return "LM (primary): business interruption";
    case "cyber_extortion":
      return "LM (primary): extortion";
    case "network_security":
      return "LM (primary): IR / recovery / technology";
    case "reputational_damage":
      return "LM (secondary): outside-party reaction";
    default:
      return c;
  }
}

function inputBasis(
  incident: Incident,
  overrides: MaterialityOverrides | undefined,
  field: keyof MaterialityInputs
): "edited" | "case default" | "filed context" | "illustrative" | "none" {
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, field))
    return "edited";
  if (field === "downtimeDays" || field === "recordsMillions") {
    return incident.modelingDefaults?.[field] != null ? "case default" : "none";
  }
  if (field === "insuranceOffsetUSDm" || field === "extortionPaymentUSDm")
    return "none";
  const financials = incident.company.financials;
  if (financials?.[field] == null) return "none";
  return financials.isIllustrative ? "illustrative" : "filed context";
}

function InputBasis({ label }: { label: ReturnType<typeof inputBasis> }) {
  return (
    <span className="ml-1 rounded-sm border border-war-border/70 px-1 py-0.5 font-mono text-[8px] uppercase tracking-wide text-war-muted/80">
      {label}
    </span>
  );
}

export function MaterialityDashboard() {
  const selected = useIncidentStore(selectSelectedIncident);
  const overrides = useIncidentStore((s) =>
    selected ? s.materialityOverridesByIncidentId[selected.id] : undefined
  );
  const setOverrides = useIncidentStore(
    (s) => s.setMaterialityOverridesForIncident
  );
  const clearOverrides = useIncidentStore(
    (s) => s.clearMaterialityOverridesForIncident
  );

  const [tab, setTab] = useState<MaterialityViewTab>("basic");
  const [stressPct, setStressPct] = useState(100);
  const [sectorPreset, setSectorPreset] = useState<SectorPresetId>("neutral");
  const [mcIterations, setMcIterations] = useState(10_000);
  const [lefAnnual, setLefAnnual] = useState(1);
  const [secondaryEventProbabilityPct, setSecondaryEventProbabilityPct] =
    useState(50);

  useEffect(() => {
    setSectorPreset("neutral");
    setStressPct(100);
    setMcIterations(10_000);
    setLefAnnual(1);
    setSecondaryEventProbabilityPct(50);
  }, [selected?.id]);

  const { inputs, outputs } = useMemo(() => {
    if (!selected) {
      const empty = {
        inputs: {
          downtimeDays: null,
          recordsMillions: null,
          revenueUSDm: null,
          ebitdaUSDm: null,
          netIncomeUSDm: null,
          extortionPaymentUSDm: null,
          insuranceOffsetUSDm: null,
        },
        outputs: {
          grossPrimaryTotalUSDm: { min: 0, mostLikely: 0, max: 0 },
          primaryTotalUSDm: { min: 0, mostLikely: 0, max: 0 },
          secondaryTotalUSDm: { min: 0, mostLikely: 0, max: 0 },
          categories: [] as CategoryEstimate[],
          confidenceLabel: "—",
        },
      };
      return empty;
    }
    return computeMateriality(selected, overrides);
  }, [selected, overrides]);

  const stressFactor = stressPct / 100;
  const outputsDisplayed = useMemo(
    () =>
      scaleMaterialityOutputs(
        outputs,
        stressFactor,
        insuranceOffsetUSDmFromInputs(inputs)
      ),
    [inputs, outputs, stressFactor]
  );

  const primaryCats = outputsDisplayed.categories.filter(
    (c) => c.kind === "primary"
  );
  const secondaryCats = outputsDisplayed.categories.filter(
    (c) => c.kind === "secondary"
  );

  const exportMaterialityBundle = () => {
    if (!selected) return;
    const payload = buildMaterialityExportPayload({
      selected,
      tab,
      lefAnnual,
      mcIterations,
      secondaryEventProbabilityPct,
      sectorPreset,
      stressPct,
      inputs,
      outputs,
      outputsDisplayed,
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `inquisition-${selected.slug}-materiality.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const applySector = (id: SectorPresetId) => {
    if (!selected) return;
    setSectorPreset(id);
    if (id === "neutral") {
      clearOverrides(selected.id);
      return;
    }
    setOverrides(selected.id, sectorPresetOverrides(selected, id));
  };

  if (!selected) {
    return (
      <div className="h-full flex items-center justify-center px-6 text-sm text-war-muted">
        Select an incident from the left library or a globe pin.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-6 pt-5 pb-3 border-b border-war-border/80 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">
                {tab === "basic" && "Estimate"}
                {tab === "advanced" && "Assumptions"}
                {tab === "fair_native" && "Simulation"}
              </span>
              <EduTooltip
                title="Estimate · Assumptions · Simulation"
                body="Estimate gives the readable loss story. Assumptions exposes the inputs and formulas underneath it. Simulation samples those same ranges and adds a bounded FAIR-style frequency sketch."
                badge="FAIR"
              />
            </div>
            <p className="text-xs text-war-muted mt-1 max-w-prose">
              Active case:{" "}
              <span className="font-medium text-war-white">
                {selected.incidentTitle}
              </span>
            </p>
            {tab === "basic" && (
              <p className="text-[10px] text-war-muted/90 mt-1 max-w-md leading-relaxed">
                Start with the range. Open Assumptions when you want to
                challenge how it was constructed.
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="self-end font-mono text-[9px] uppercase tracking-wide text-war-muted">
              Depth
            </span>
            <div className="flex flex-wrap justify-end gap-1.5">
              {(
                [
                  ["basic", "Estimate"],
                  ["advanced", "Assumptions"],
                  ["fair_native", "Simulation"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    tab === id
                      ? "border-emerald-300 bg-emerald-300 text-[#02110c]"
                      : "border-emerald-400/15 text-war-muted hover:border-emerald-300/40 hover:text-war-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ModelLimitsStrip />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-transparent px-6 pb-6 pt-4">
        {tab === "advanced" && <FairMethodologyDeepDive />}

        {tab === "fair_native" && (
          <FairNativeMaterialityPanel
            categories={outputsDisplayed.categories}
            insuranceOffsetUSDm={insuranceOffsetUSDmFromInputs(inputs)}
            iterations={mcIterations}
            onIterationsChange={setMcIterations}
            lefAnnual={lefAnnual}
            onLefAnnualChange={setLefAnnual}
            secondaryEventProbabilityPct={secondaryEventProbabilityPct}
            onSecondaryEventProbabilityPctChange={
              setSecondaryEventProbabilityPct
            }
          />
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <article className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-war-white/90 mb-2">
              {tab === "basic" ? (
                <>
                  Gross direct loss
                  <EduTooltip
                    title="Gross direct loss"
                    body="Estimated primary loss before insurance recovery: data response, lost contribution margin, system recovery and evidenced extortion."
                    badge="Intro"
                  />
                </>
              ) : tab === "advanced" ? (
                <>
                  Gross primary loss (USD)
                  <EduTooltip
                    title="Primary loss"
                    body="Primary loss before insurance recovery: data response, contribution-margin interruption, remediation and evidenced extortion."
                    badge="FAIR"
                  />
                </>
              ) : (
                <>
                  Gross primary LM — deterministic
                  <EduTooltip
                    title="vs simulation"
                    body="These min/mode/max come from the same bridge shown under Assumptions, after stress and before insurance recovery. Simulation reports gross and retained outcomes separately."
                    badge="FAIR"
                  />
                </>
              )}
            </h3>
            <p className="text-lg font-bold text-war-white">
              {formatRangeM(outputsDisplayed.grossPrimaryTotalUSDm)}
            </p>
            <p className="text-[10px] text-war-muted mt-1">
              min · most likely · max (millions USD)
            </p>
            {(inputs.insuranceOffsetUSDm ?? 0) > 0 && (
              <p className="mt-1 text-[10px] text-sky-200/80">
                Retained after recovery assumption:{" "}
                {formatRangeM(outputsDisplayed.primaryTotalUSDm)}
              </p>
            )}
          </article>
          <article className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-3">
            <h3 className="flex items-center gap-1.5 text-xs font-medium text-war-white/90 mb-2">
              {tab === "basic" ? (
                <>
                  External reaction, if it occurs
                  <EduTooltip
                    title="Conditional external reaction"
                    body="Possible loss caused by customers, regulators, litigants or other outside parties. Simulation controls whether that secondary event occurs."
                    badge="Intro"
                  />
                </>
              ) : tab === "advanced" ? (
                <>
                  Conditional secondary loss (USD)
                  <EduTooltip
                    title="Secondary loss"
                    body="Loss caused by outside-party reaction. This is the magnitude if the secondary event occurs, not a claim that it certainly will."
                    badge="FAIR"
                  />
                </>
              ) : (
                <>
                  Conditional secondary LM
                  <EduTooltip
                    title="Secondary LM"
                    body="Magnitude conditional on an outside-party reaction. Simulation applies the selected event probability before including it in retained total loss."
                    badge="FAIR"
                  />
                </>
              )}
            </h3>
            <p className="text-lg font-bold text-emerald-300/90">
              {formatRangeM(outputsDisplayed.secondaryTotalUSDm)}
            </p>
            <p className="text-[10px] text-war-muted mt-1">
              Conditional magnitude; occurrence probability is set in Simulation
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-war-muted">
              {tab === "basic" ? "How sure?" : "Confidence"}
            </span>
            <span className="text-sm font-semibold text-war-white">
              {outputs.confidenceLabel}
            </span>
            <EduTooltip
              title={tab === "basic" ? "How sure?" : "Confidence label"}
              body={
                tab === "basic"
                  ? "Simple gut check from the model: if we don’t know revenue scale, bands stay wide. Open Assumptions for the full financial inputs."
                  : "Heuristic: without disclosed revenue scale, ranges are wider and confidence is lower. Add better financials via overrides."
              }
              badge={tab === "basic" ? "Intro" : "FAIR"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMaterialityBundle}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-sky-500/50 text-sky-200 hover:bg-sky-950/40"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => {
                clearOverrides(selected.id);
                setSectorPreset("neutral");
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-war-border text-war-muted hover:text-war-white hover:bg-war-border/40"
            >
              Reset overrides
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-4 space-y-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-war-white/90">
            {tab === "basic" ? (
              <>
                Scenario size
                <EduTooltip
                  title="Bigger or smaller?"
                  body="Slides all dollar bands together—like asking ‘what if this breach is 20% worse than the middle guess?’ Sector shortcuts are under Assumptions and Simulation."
                  badge="Intro"
                />
              </>
            ) : (
              <>
                Scenario stress & sector bias
                <EduTooltip
                  title="Why stress & sectors?"
                  body="Stress scales all category dollars up or down for sensitivity. Sector presets nudge inputs (records, downtime, insurance offset) for common industry patterns; they do not replace case evidence."
                  badge="FAIR"
                />
              </>
            )}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-war-muted">
              <span>Stress ({stressPct}%)</span>
              <span>
                {tab === "basic"
                  ? "Scales every band up or down"
                  : "Scales all displayed ranges"}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={stressPct}
              onChange={(e) => setStressPct(Number(e.target.value))}
              className="w-full accent-sky-500"
              aria-label="Scenario stress percent"
            />
          </div>
          {tab !== "basic" && (
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  "neutral",
                  "healthcare",
                  "retail_pci",
                  "financial",
                  "tech_saas",
                  "industrial_ot",
                ] satisfies SectorPresetId[]
              ).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applySector(id)}
                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-colors ${
                    sectorPreset === id
                      ? "border-emerald-400/70 bg-emerald-950/40 text-emerald-200"
                      : "border-war-border text-war-muted hover:text-war-white hover:bg-war-border/30"
                  }`}
                >
                  {sectorPresetLabel(id)}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-4 space-y-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-war-white/90">
            {tab === "basic" ? (
              <>
                A few facts from the story
                <EduTooltip
                  title="Keep it simple"
                  body="These three drivers move most of the teaching ranges. Open Assumptions for EBITDA, net income, and insurance offset."
                  badge="Intro"
                />
              </>
            ) : (
              <>
                Model inputs
                <EduTooltip
                  title="Inputs & provenance"
                  body="Defaults come from the case record. Edits update the materiality engine immediately; Assumptions shows the formulas tied to these numbers."
                  badge="FAIR"
                />
              </>
            )}
          </h3>
          <div
            className={`grid gap-3 text-[11px] ${
              tab === "basic"
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            <label className="flex flex-col gap-1">
              <span className="text-war-muted">
                Downtime (days)
                <InputBasis
                  label={inputBasis(selected, overrides, "downtimeDays")}
                />
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={inputs.downtimeDays ?? ""}
                onChange={(e) =>
                  setOverrides(selected.id, {
                    downtimeDays:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-war-muted">
                Records (millions)
                <InputBasis
                  label={inputBasis(selected, overrides, "recordsMillions")}
                />
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={inputs.recordsMillions ?? ""}
                onChange={(e) =>
                  setOverrides(selected.id, {
                    recordsMillions:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-war-muted">
                Revenue ($M)
                <InputBasis
                  label={inputBasis(selected, overrides, "revenueUSDm")}
                />
              </span>
              <input
                type="number"
                min={0}
                step={1}
                value={inputs.revenueUSDm ?? ""}
                onChange={(e) =>
                  setOverrides(selected.id, {
                    revenueUSDm:
                      e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
              />
            </label>
            {tab !== "basic" && (
              <>
                <label className="flex flex-col gap-1">
                  <span className="text-war-muted">
                    EBITDA ($M)
                    <InputBasis
                      label={inputBasis(selected, overrides, "ebitdaUSDm")}
                    />
                  </span>
                  <input
                    type="number"
                    step={1}
                    value={inputs.ebitdaUSDm ?? ""}
                    onChange={(e) =>
                      setOverrides(selected.id, {
                        ebitdaUSDm:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-war-muted">
                    Net income ($M)
                    <InputBasis
                      label={inputBasis(selected, overrides, "netIncomeUSDm")}
                    />
                  </span>
                  <input
                    type="number"
                    step={1}
                    value={inputs.netIncomeUSDm ?? ""}
                    onChange={(e) =>
                      setOverrides(selected.id, {
                        netIncomeUSDm:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-war-muted">
                    Extortion paid / assumed ($M)
                    <InputBasis
                      label={inputBasis(
                        selected,
                        overrides,
                        "extortionPaymentUSDm"
                      )}
                    />
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={inputs.extortionPaymentUSDm ?? ""}
                    onChange={(e) =>
                      setOverrides(selected.id, {
                        extortionPaymentUSDm:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-war-muted">
                    Insurance recovery ($M)
                    <InputBasis
                      label={inputBasis(
                        selected,
                        overrides,
                        "insuranceOffsetUSDm"
                      )}
                    />
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={inputs.insuranceOffsetUSDm ?? ""}
                    onChange={(e) =>
                      setOverrides(selected.id, {
                        insuranceOffsetUSDm:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="rounded-lg bg-black/50 border border-war-border/60 px-2 py-1.5 text-war-white"
                  />
                </label>
              </>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-war-border/80 bg-black/60 px-4 py-4 space-y-4">
          <h3 className="text-xs font-semibold tracking-[0.15em] text-war-muted uppercase">
            {tab === "basic"
              ? "Where the money goes (simplified)"
              : tab === "fair_native"
                ? "LM decomposition (buckets)"
                : "Category breakdown"}
          </h3>
          {tab === "fair_native" && (
            <p className="text-[9px] text-slate-400 leading-relaxed border-l-2 border-amber-500/40 pl-2 -mt-2 mb-1">
              Rows start <strong className="text-slate-300">compact</strong>{" "}
              (range + simulation note). Use{" "}
              <strong className="text-slate-300">Show formula…</strong> per
              bucket for provenance, interpretation and control questions.
            </p>
          )}

          <div>
            <h4 className="text-[10px] text-sky-400/90 uppercase tracking-wide mb-2">
              {tab === "basic"
                ? "Direct"
                : tab === "fair_native"
                  ? "Primary LM buckets"
                  : "Primary"}
            </h4>
            <ul className="space-y-3">
              {primaryCats.map((c) => (
                <CategoryRow key={c.category} estimate={c} tab={tab} />
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] text-emerald-400/90 uppercase tracking-wide mb-2">
              {tab === "basic"
                ? "Conditional external reaction"
                : tab === "fair_native"
                  ? "Secondary LM buckets"
                  : "Secondary"}
            </h4>
            <ul className="space-y-3">
              {secondaryCats.map((c) => (
                <CategoryRow key={c.category} estimate={c} tab={tab} />
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-war-border/40 bg-black/40 px-4 py-3">
          <p className="text-[10px] text-war-muted leading-relaxed">
            {tab === "basic" ? (
              <>
                Tags for this story:{" "}
                <span className="text-war-white/80">
                  {selected.taxonomyTags.join(", ") || "—"}
                </span>
                . They hint which buckets matter most (e.g. lots of records →
                privacy costs).
              </>
            ) : (
              <>
                Taxonomy tags on this incident:{" "}
                <span className="text-war-white/80">
                  {selected.taxonomyTags.join(", ") || "—"}
                </span>
                . Map breach types to loss forms (e.g. records → privacy; outage
                → BI) when calibrating external studies.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

function CategoryProvenanceBlock({
  estimate,
  showAdvancedHint,
}: {
  estimate: CategoryEstimate;
  showAdvancedHint: boolean;
}) {
  return (
    <div className="mt-2 text-[10px] text-war-muted space-y-2 border-t border-war-border/30 pt-2">
      <p>
        <span className="text-war-white/80 font-medium">Formula: </span>
        {estimate.provenance.formula}
      </p>
      <ul className="list-disc list-inside">
        {Object.entries(estimate.provenance.inputs).map(([k, v]) => (
          <li key={k}>
            {k}: {v === null || v === undefined ? "—" : String(v)}
          </li>
        ))}
      </ul>
      {estimate.provenance.notes && estimate.provenance.notes.length > 0 && (
        <ul className="text-emerald-300/80 list-disc list-inside">
          {estimate.provenance.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
      {showAdvancedHint && (
        <p className="text-[9px] text-war-muted/75 italic">
          Interpretation and control questions → expand in{" "}
          <span className="text-amber-200/90">Simulation</span> (per bucket).
        </p>
      )}
    </div>
  );
}

function CategoryRow({
  estimate,
  tab,
}: {
  estimate: CategoryEstimate;
  tab: MaterialityViewTab;
}) {
  const [fairExpanded, setFairExpanded] = useState(false);

  useEffect(() => {
    if (tab !== "fair_native") setFairExpanded(false);
  }, [tab]);

  const title =
    tab === "basic"
      ? basicCategoryLabel(estimate.category)
      : tab === "fair_native"
        ? fairNativeCategoryLabel(estimate.category)
        : categoryLabel(estimate.category);
  const badge =
    tab === "basic"
      ? estimate.kind === "primary"
        ? "Direct"
        : "Knock-on"
      : kindLabel(estimate.kind);
  const tooltipBadge =
    tab === "basic" ? "Intro" : tab === "fair_native" ? "FAIR" : "FAIR";

  return (
    <li className="rounded-lg border border-war-border/50 bg-black/50 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-war-white">{title}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {badge}
          </span>
          <EduTooltip
            title={
              tab === "fair_native"
                ? fairNativeCategoryLabel(estimate.category)
                : estimate.provenance.label
            }
            body={
              tab === "basic"
                ? "Teaching range for this bucket—tighten it with evidence and open Assumptions when you need the formula."
                : `${estimate.provenance.formula} Category ranges are illustrative; substitute defensible sector curves and cited record counts when available.`
            }
            badge={tooltipBadge}
          />
        </div>
        <div className="text-xs font-semibold text-sky-200">
          {formatRangeM(estimate.rangeUSDm)}
        </div>
      </div>
      {tab === "advanced" && (
        <CategoryProvenanceBlock estimate={estimate} showAdvancedHint />
      )}
      {tab === "fair_native" && (
        <>
          <p className="mt-2 text-[9px] text-amber-100/95 border-l-2 border-amber-400/50 pl-2 leading-relaxed">
            Monte Carlo: triangular(min, mode, max) per bucket—independent
            draws, no correlation.
          </p>
          {!fairExpanded && (
            <button
              type="button"
              className="mt-2 w-full sm:w-auto rounded-lg border border-amber-500/45 bg-amber-950/30 px-3 py-2.5 min-h-[44px] text-[10px] font-medium text-amber-100 hover:bg-amber-950/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-expanded={false}
              onClick={() => setFairExpanded(true)}
            >
              Show formula, interpretation &amp; control questions
            </button>
          )}
          {fairExpanded && (
            <>
              <CategoryProvenanceBlock
                estimate={estimate}
                showAdvancedHint={false}
              />
              {estimate.provenance.analysisHint && (
                <div className="mt-2 rounded-lg border border-violet-500/35 bg-violet-950/30 px-2 py-1.5 space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-violet-100">
                    Interpretation
                  </div>
                  <p className="text-[10px] text-violet-50/95 leading-relaxed">
                    {estimate.provenance.analysisHint}
                  </p>
                </div>
              )}
              {estimate.provenance.controlQuestions &&
                estimate.provenance.controlQuestions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-emerald-500/35 bg-emerald-950/25 px-2 py-1.5 space-y-1">
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-100">
                      Control questions
                    </div>
                    <ul className="list-disc list-inside text-[10px] text-emerald-50/95 space-y-0.5">
                      {estimate.provenance.controlQuestions.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              <button
                type="button"
                className="mt-2 text-[10px] text-amber-200 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded px-1 py-1"
                aria-expanded
                onClick={() => setFairExpanded(false)}
              >
                Hide detail
              </button>
            </>
          )}
        </>
      )}
    </li>
  );
}

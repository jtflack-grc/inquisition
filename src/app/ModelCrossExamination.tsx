import { useMemo } from "react";
import { interrogateModel } from "../inquisition/modelCrossExamination";
import type {
  Incident,
  MaterialityInputs,
  MaterialityOutputs,
  MaterialityOverrides,
} from "../inquisition/types";
import type { AppliedTefCalibration } from "../inquisition/tefCalibration";
import { EduTooltip } from "./EduTooltip";

export function ModelCrossExamination({
  incident,
  inputs,
  outputs,
  overrides,
  stressPercent,
  lefAnnual,
  secondaryProbabilityPercent,
  tefCalibration,
}: {
  incident: Incident;
  inputs: MaterialityInputs;
  outputs: MaterialityOutputs;
  overrides?: MaterialityOverrides;
  stressPercent: number;
  lefAnnual: number;
  secondaryProbabilityPercent: number;
  tefCalibration?: AppliedTefCalibration | null;
}) {
  const challenges = useMemo(
    () =>
      interrogateModel({
        incident,
        inputs,
        outputs,
        overrides,
        stressPercent,
        lefAnnual,
        secondaryProbabilityPercent,
        tefCalibration,
      }),
    [
      incident,
      inputs,
      outputs,
      overrides,
      stressPercent,
      lefAnnual,
      secondaryProbabilityPercent,
      tefCalibration,
    ]
  );
  const evidenceNeeded = challenges.filter(
    (c) => c.status === "needs-evidence" || c.status === "structural"
  ).length;

  return (
    <section className="border border-war-border bg-[#0d1115] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7ea4bf]">
            Model integrity / investigative review
          </div>
          <h3 className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-war-white">
            Model Cross-Examination
            <EduTooltip
              title="An examination, not a confidence score"
              body="These are explicit methodological questions generated from the current inputs, source links and simplifying assumptions. A flagged item is not proof of error, and an unflagged item is not validation. We do not convert evidence provenance into a numerical confidence score."
              badge="FAIR"
            />
          </h3>
          <p className="mt-1 max-w-prose text-[10px] leading-relaxed text-war-muted">
            Which assumptions could change the decision? Which answers need
            additional evidence? Challenge the analysis without treating every
            missing source as evidence of failure.
          </p>
        </div>
        <div className="font-mono text-[10px] text-war-muted">
          {evidenceNeeded} of {challenges.length} questions require evidence
        </div>
      </div>
      <details className="mt-3 border-t border-war-border/60 pt-3">
        <summary className="cursor-pointer text-[11px] font-medium text-[#a5c3d3]">
          Open investigative questions ({challenges.length})
        </summary>
        <div className="mt-3 space-y-2">
          {challenges.map((challenge, i) => (
            <details
              key={challenge.id}
              className="border-b border-war-border/60 py-2 text-[10px]"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-3 text-war-white">
                <span>
                  <span className="mr-2 font-mono text-war-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {challenge.question}
                </span>
                <span className="shrink-0 font-mono text-[9px] text-war-muted">
                  {challenge.status === "needs-evidence"
                    ? "EVIDENCE"
                    : challenge.status === "structural"
                      ? "STRUCTURAL"
                      : "ASSUMPTION"}
                </span>
              </summary>
              <div className="mt-2 space-y-2 border-l border-[#7ea4bf]/50 pl-3 leading-relaxed text-war-muted">
                <p>{challenge.observed}</p>
                <p>
                  <span className="font-medium text-war-white">
                    What would resolve it:{" "}
                  </span>
                  {challenge.resolveBy}
                </p>
              </div>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}

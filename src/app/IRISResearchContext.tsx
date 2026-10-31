import type { Incident } from "../inquisition/types";
import {
  IRIS_XTREME_2026,
  irisResearchPrompts,
  irisRevenueBenchmark,
} from "../inquisition/irisXtremeResearch";

export function IRISResearchContext({
  incident,
  modeledEventP90USDm,
}: {
  incident: Incident;
  modeledEventP90USDm?: number;
}) {
  const revenueUSDm = incident.company.financials?.revenueUSDm ?? null;
  const benchmark = irisRevenueBenchmark(revenueUSDm);
  const prompts = irisResearchPrompts(incident.taxonomyTags);
  return (
    <section className="border border-war-border/70 bg-[#0d1115] px-3 py-3">
      <details>
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-war-white">
          <span>IRIS Xtreme / external research context</span>
          <span className="font-mono text-[9px] font-normal uppercase text-[#a5c3d3]">
            Cross-examination, not calibration
          </span>
        </summary>
        <div className="mt-3 space-y-3 text-[10px] leading-relaxed text-war-muted">
          <p>
            <strong className="text-war-white">Population:</strong> Cyentia
            Institute's 2026 Xtreme study examined 136 selected high-loss events
            totaling $26.4B in reported losses. It does not publish a named,
            ranked event roster. This case has{" "}
            <strong className="text-war-white">not</strong> been verified as
            belonging to that sample.
          </p>
          <div className="space-y-2 border-t border-war-border/60 pt-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.title}
                className="border-l border-[#7ea4bf]/50 pl-3"
              >
                <div className="font-medium text-war-white">{prompt.title}</div>
                <p>{prompt.body}</p>
                <a
                  href={`${IRIS_XTREME_2026.sourceUrl}#page=${prompt.page}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-[#a5c3d3] underline underline-offset-2"
                >
                  Inspect report around page {prompt.page}
                </a>
              </div>
            ))}
          </div>
          <div className="border-t border-war-border/60 pt-2">
            <div className="font-medium text-war-white">
              Revenue-band reference · IRIS 2025, reproduced in IRIS Xtreme
            </div>
            {benchmark ? (
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  Revenue group:{" "}
                  <span className="font-mono text-war-white">
                    {benchmark.label}
                  </span>
                  <div>
                    All-incident P95:{" "}
                    <span className="font-mono text-war-white">
                      $${benchmark.p95USDm.toFixed(1)}M
                    </span>
                  </div>
                </div>
                {modeledEventP90USDm !== undefined && (
                  <div>
                    INQUISITION modeled{" "}
                    <strong className="text-war-white">per-event P90</strong>:{" "}
                    <span className="font-mono text-war-white">
                      $${modeledEventP90USDm.toFixed(1)}M
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-1">
                No verified annual revenue entered. Revenue-band comparison
                withheld rather than assuming a company size.
              </p>
            )}
            <p className="mt-1">
              Different quantiles, time windows, modeled-versus-reported
              accounting bases and selected populations: this is a discussion
              prompt, never an automatic model fit or validation test.
            </p>
          </div>
          <p className="border-t border-war-border/60 pt-2 text-[9px]">
            <a
              className="text-[#a5c3d3] underline underline-offset-2"
              href={IRIS_XTREME_2026.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the full Cyentia IRIS Xtreme 2026 study
            </a>
            . All dollar values cited from the study are inflation-adjusted 2025
            USD; INQUISITION's case model is a separate illustrative teaching
            estimate. Report figures are paraphrased and attributed.
          </p>
        </div>
      </details>
    </section>
  );
}

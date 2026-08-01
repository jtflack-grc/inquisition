import { EduTooltip } from "./EduTooltip";

/**
 * Always-visible guardrails so users don’t over-read the bridge or Monte Carlo.
 */
export function ModelLimitsStrip() {
  return (
    <div
      className="shrink-0 border-b border-emerald-400/15 bg-[#07110f] px-5 py-2.5"
      role="region"
      aria-label="Model limitations"
    >
      <div className="flex max-w-[52rem] items-start gap-2">
        <span className="mt-0.5 shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300">
          Model note
        </span>
        <p className="text-[10px] leading-relaxed text-slate-300 sm:text-[11px]">
          Transparent teaching ranges, not a legal materiality determination.
          Simulation uses independent triangular loss buckets; it is not a
          certified FAIR analysis.
        </p>
        <EduTooltip
          title="Model boundaries"
          body="The casebook is designed to expose assumptions, not manufacture precision. Use it to structure questions and compare public incidents; use primary documents, finance, counsel, and qualified practitioners for decisions."
          badge="FAIR"
          className="shrink-0 mt-0.5"
        />
      </div>
    </div>
  );
}

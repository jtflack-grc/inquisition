/**
 * Compact assumptions context. Deeper FAIR references live under Simulation.
 */

export function FairMethodologyDeepDive() {
  return (
    <section className="rounded-xl border border-violet-500/35 bg-violet-950/15 px-4 py-3 space-y-2 text-[10px] text-war-muted leading-relaxed">
      <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase text-violet-200/95">
        Assumptions — deterministic bridge
      </h2>
      <p>
        <strong className="text-war-white/90">FAIR™</strong> separates{" "}
        <strong className="text-war-white/85">Loss Event Frequency</strong> from{" "}
        <strong className="text-war-white/85">Loss Magnitude</strong> (primary
        vs secondary). This tab stays{" "}
        <strong className="text-war-white/85">deterministic</strong>:
        transparent min / most likely / max by category, with formulas and
        inputs below each row.
      </p>
      <p className="text-war-muted/85">
        INQUISITION uses core FAIR loss-magnitude concepts with its own compact
        incident-cost taxonomy. For conditional secondary loss, workflow notes
        and LM Monte Carlo, open{" "}
        <strong className="text-amber-200/90">Simulation</strong>.
      </p>
      <a
        href="https://www.fairinstitute.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-[10px] text-sky-400 hover:text-sky-300 underline"
      >
        The FAIR Institute →
      </a>
    </section>
  );
}

import { useState, type ReactNode } from "react";

export function FairNativeReferenceSections() {
  const [lossOpen, setLossOpen] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Collapsible
        title="INQUISITION loss taxonomy"
        open={lossOpen}
        onToggle={() => setLossOpen((open) => !open)}
      >
        <p className="mb-2 text-[9px] text-war-muted/90">
          This is an original, compact incident-cost taxonomy informed by core
          FAIR loss-magnitude reasoning. It is not a reproduction or
          implementation of a proprietary extension.
        </p>
        <ul className="space-y-1 text-[9px] text-war-muted">
          <li>
            <strong className="text-war-white/85">Data and privacy:</strong>{" "}
            investigation, notification and consumer support.
          </li>
          <li>
            <strong className="text-war-white/85">Interruption:</strong>{" "}
            estimated lost contribution margin during degraded operations.
          </li>
          <li>
            <strong className="text-war-white/85">
              Response and recovery:
            </strong>{" "}
            forensics, containment, restoration and extraordinary professional
            expense.
          </li>
          <li>
            <strong className="text-war-white/85">Extortion:</strong> payment or
            demand modeled separately from recovery expense.
          </li>
          <li>
            <strong className="text-war-white/85">External reaction:</strong>{" "}
            conditional loss caused by regulators, litigants, customers or other
            outside parties.
          </li>
        </ul>
      </Collapsible>

      <Collapsible
        title="Control questions"
        open={controlOpen}
        onToggle={() => setControlOpen((open) => !open)}
      >
        <ul className="list-disc list-inside space-y-1 text-[9px] text-war-muted">
          <li>
            Which controls change the probability of the primary loss event?
          </li>
          <li>
            Which controls reduce duration, affected records or recovery expense
            after it occurs?
          </li>
          <li>
            Which evidence demonstrates that those controls operated during this
            incident?
          </li>
          <li>
            Which outside-party reactions remain possible, and what would
            trigger them?
          </li>
        </ul>
      </Collapsible>

      <Collapsible
        title="Analysis workflow"
        open={flowOpen}
        onToggle={() => setFlowOpen((open) => !open)}
      >
        <ol className="list-decimal list-inside space-y-1 text-[9px] text-war-muted">
          <li>
            <strong className="text-war-white/85">Scope</strong> one event,
            asset and affected organization.
          </li>
          <li>
            <strong className="text-war-white/85">Separate evidence</strong>{" "}
            from inferred inputs and teaching defaults.
          </li>
          <li>
            <strong className="text-war-white/85">Estimate gross loss</strong>{" "}
            by category before insurance recovery.
          </li>
          <li>
            <strong className="text-war-white/85">
              Model outside-party reaction
            </strong>{" "}
            as conditional rather than certain.
          </li>
          <li>
            <strong className="text-war-white/85">Escalate materiality</strong>{" "}
            to finance and counsel; the model does not make the legal
            determination.
          </li>
        </ol>
      </Collapsible>
    </div>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-war-border/45 bg-black/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[10px] font-medium text-amber-100/95 hover:bg-black/30"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-war-muted tabular-nums">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-war-border/30 px-3 pb-3 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

import type { Range3 } from "../inquisition/types";
import { lossRangePositions } from "./lossRangePositions";

function format(value: number) {
  return "$" + value.toFixed(1) + "M";
}

export function LossRangeOverview({
  primary,
  secondary,
}: {
  primary: Range3;
  secondary: Range3;
}) {
  const max = Math.max(primary.max, secondary.max, 1);
  const rows = [
    { id: "primary", name: "Gross primary loss", range: primary, conditional: false },
    { id: "secondary", name: "External reaction", range: secondary, conditional: true },
  ];
  return (
    <section className="loss-overview" aria-label="Modeled loss ranges on a common dollar scale">
      <div className="loss-overview__masthead">
        <span>MODEL AT A GLANCE</span>
        <span>SHARED SCALE · $M</span>
      </div>
      {rows.map(({ id, name, range, conditional }) => {
        const pos = lossRangePositions(range, max);
        return (
          <div className="loss-overview__row" key={id}>
            <div className="loss-overview__row-head">
              <span>{name}</span>
              <span>{conditional ? "If outside parties react" : "Before insurance recovery"}</span>
            </div>
            <div
              className={"loss-overview__track loss-overview__track--" + id}
              role="img"
              aria-label={name + ": low " + format(range.min) + ", most likely " + format(range.mostLikely) + ", high " + format(range.max) + (conditional ? ", conditional on external reaction" : "")}
            >
              <div className="loss-overview__axis" />
              <div className="loss-overview__band" style={{ left: pos.low + "%", width: pos.span + "%" }} />
              <div className="loss-overview__tick" style={{ left: pos.mode + "%" }} />
            </div>
            <div className="loss-overview__values">
              <span>LOW {format(range.min)}</span>
              <strong>MODE {format(range.mostLikely)}</strong>
              <span>HIGH {format(range.max)}</span>
            </div>
          </div>
        );
      })}
      <p className="loss-overview__note">
        Band = illustrative low–high magnitude; line = mode. These are not event probabilities or confidence intervals. The secondary band applies only if the external reaction occurs.
      </p>
    </section>
  );
}

import type { Range3 } from "../inquisition/types";
import { lossRangePositions } from "./lossRangePositions";
import { EduTooltip } from "./EduTooltip";

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
  const reportedMax = Math.max(primary.max, secondary.max, 0);
  const max = Math.max(reportedMax, 1);
  const rows = [
    {
      id: "primary",
      name: "Gross primary loss",
      range: primary,
      conditional: false,
    },
    {
      id: "secondary",
      name: "External reaction",
      range: secondary,
      conditional: true,
    },
  ];
  return (
    <section
      className="loss-overview"
      aria-label="Modeled loss ranges on a common dollar scale"
    >
      <div className="loss-overview__masthead">
        <span>LOSS MAGNITUDE / ONE EVENT</span>
        <div className="loss-overview__teach">
          <span>SHARED SCALE · $M</span>
          <EduTooltip
            title="FAIR: how often versus how much?"
            badge="FAIR"
            body="FAIR distinguishes Loss Event Frequency (LEF: how often loss events occur) from Loss Magnitude (LM: how costly an event is when it happens). This chart is an illustrative LM teaching model. It contains no LEF estimate. Simulation provides a simplified, assumed annual LEF—not a calibrated Threat Event Frequency / Vulnerability model."
          />
        </div>
      </div>
      <div className="loss-overview__scale" aria-hidden="true">
        <span>$0M</span>
        <span>{format(reportedMax)}</span>
      </div>
      {rows.map(({ id, name, range, conditional }) => {
        const pos = lossRangePositions(range, max);
        return (
          <div className="loss-overview__row" key={id}>
            <div className="loss-overview__row-head">
              <span className="loss-overview__row-title">
                {name}
                <EduTooltip
                  title={
                    conditional ? "FAIR: secondary loss" : "FAIR: primary loss"
                  }
                  badge="FAIR"
                  body={
                    conditional
                      ? "Secondary loss arises from the reactions of outside stakeholders to a primary loss event—for example regulators, customers or litigants. It is not simply 'loss that happens later.' This range is the magnitude if that secondary event occurs; the chart does not estimate its probability."
                      : "Primary loss is borne by the organization from the loss event and its own response, such as interruption, investigation or restoration. It is not simply a synonym for immediate loss. This is a gross modeled range before any insurance recovery offset."
                  }
                />
              </span>
              <span>
                {conditional
                  ? "If outside parties react"
                  : "Before insurance recovery"}
              </span>
            </div>
            <div
              className={"loss-overview__track loss-overview__track--" + id}
              role="img"
              aria-label={
                name +
                ": low " +
                format(range.min) +
                ", most likely " +
                format(range.mostLikely) +
                ", high " +
                format(range.max) +
                (conditional ? ", conditional on external reaction" : "")
              }
            >
              <div className="loss-overview__axis" />
              <div
                className="loss-overview__band"
                style={{ left: pos.low + "%", width: pos.span + "%" }}
              />
              <div
                className="loss-overview__tick"
                style={{ left: pos.mode + "%" }}
              />
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
        Band = illustrative low–high magnitude; line = mode. These are not event
        probabilities or confidence intervals. The secondary band applies only
        if the external reaction occurs.
      </p>
    </section>
  );
}

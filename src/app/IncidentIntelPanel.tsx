import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  EvidenceItem,
  EvidenceTrustTier,
  EvidenceType,
  Incident,
} from "../inquisition/types";
import {
  resolveEvidenceTrust,
  TRUST_TIER_GLOSSARY,
  trustTierSortKey,
} from "../inquisition/trustTiers";
import {
  selectFilteredIncidents,
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import { TimelinePlaybackControls } from "./TimelinePlaybackControls";

const EVIDENCE_GROUP_ORDER: {
  key: "sec" | "lawsuit" | "regulator" | "news";
  label: string;
}[] = [
  { key: "sec", label: "SEC & filings" },
  { key: "lawsuit", label: "Litigation" },
  { key: "regulator", label: "Regulators" },
  { key: "news", label: "News & trade press" },
];

const GLOSSARY_TIER_ORDER: EvidenceTrustTier[] = [
  "issuer_primary",
  "regulator_primary",
  "litigation_index",
  "navigation_hub",
  "news_media",
];

/** Per-link “captured on” staleness hint. */
const STALE_RETRIEVED_DAYS = 365;

function bucketForEvidence(
  e: EvidenceItem
): "sec" | "lawsuit" | "regulator" | "news" {
  if (e.type === "sec_8k" || e.type === "sec_other") return "sec";
  if (e.type === "lawsuit") return "lawsuit";
  if (e.type === "regulator") return "regulator";
  return "news";
}

function trustBadgeClass(tier: EvidenceTrustTier): string {
  switch (tier) {
    case "issuer_primary":
      return "border-amber-500/50 text-amber-200/95 bg-amber-950/35";
    case "regulator_primary":
      return "border-violet-500/50 text-violet-200/95 bg-violet-950/35";
    case "litigation_index":
      return "border-sky-500/50 text-sky-200/95 bg-sky-950/35";
    case "navigation_hub":
      return "border-slate-500/50 text-slate-300 bg-slate-900/50";
    case "news_media":
      return "border-emerald-500/40 text-emerald-200/90 bg-emerald-950/25";
    default:
      return "border-war-border text-war-muted";
  }
}

function typeBadge(type: EvidenceType): string {
  switch (type) {
    case "sec_8k":
      return "8-K";
    case "sec_other":
      return "SEC";
    case "lawsuit":
      return "Docket";
    case "regulator":
      return "Reg";
    default:
      return "News";
  }
}

function linkRoleBadgeClass(isHub: boolean): string {
  return isHub
    ? "border-amber-500/35 text-amber-200/85 bg-amber-950/20"
    : "border-slate-500/40 text-slate-200/90 bg-slate-900/40";
}

function daysSinceIso(iso: string): number | null {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso;
  const t = Date.parse(normalized);
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 86400000;
}

function formatEvidenceDateLine(ev: EvidenceItem): string | null {
  const parts: string[] = [];
  if (ev.publishedAt) parts.push(`Source: ${ev.publishedAt}`);
  if (ev.retrievedAt) parts.push(`Captured: ${ev.retrievedAt}`);
  return parts.length ? parts.join(" · ") : null;
}

function sortEvidenceByTrust(items: EvidenceItem[]): EvidenceItem[] {
  return [...items].sort((a, b) => {
    const ta = resolveEvidenceTrust(a).tier;
    const tb = resolveEvidenceTrust(b).tier;
    const diff = trustTierSortKey(ta) - trustTierSortKey(tb);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

function scrollPanelToId(container: HTMLElement | null, id: string) {
  if (!container) return;
  const el = document.getElementById(id);
  if (!el) return;
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const delta = eRect.top - cRect.top + container.scrollTop - 8;
  container.scrollTo({ top: Math.max(0, delta), behavior: "smooth" });
}

/** Single-line label for <option> (native select has no subtitles). */
function incidentOptionLabel(inc: Incident): string {
  const company = inc.company.name.trim();
  const title = inc.incidentTitle.trim();
  const raw = `${company} — ${title}`;
  return raw.length > 118 ? `${raw.slice(0, 115)}…` : raw;
}

export function IncidentIntelPanel() {
  const incidentQuery = useIncidentStore((s) => s.incidentQuery);
  const setIncidentQuery = useIncidentStore((s) => s.setIncidentQuery);
  const setSelectedIncidentId = useIncidentStore(
    (s) => s.setSelectedIncidentId
  );
  const incidents = useIncidentStore((s) => s.incidents);
  const filtered = useIncidentStore(selectFilteredIncidents);
  const selected = useIncidentStore(selectSelectedIncident);
  const [panelToast, setPanelToast] = useState<string | null>(null);
  const [expandedEvidenceGroups, setExpandedEvidenceGroups] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(EVIDENCE_GROUP_ORDER.map((g) => [g.key, false])));
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback((id: string) => {
    scrollPanelToId(scrollAreaRef.current, id);
  }, []);

  const groupedEvidence = useMemo(() => {
    if (!selected) return new Map<string, EvidenceItem[]>();
    const map = new Map<string, EvidenceItem[]>();
    for (const g of EVIDENCE_GROUP_ORDER) {
      map.set(g.key, []);
    }
    for (const e of selected.evidence) {
      const b = bucketForEvidence(e);
      map.get(b)!.push(e);
    }
    for (const g of EVIDENCE_GROUP_ORDER) {
      const arr = map.get(g.key);
      if (arr?.length) map.set(g.key, sortEvidenceByTrust(arr));
    }
    return map;
  }, [selected]);

  const jumpTargets = useMemo(() => {
    if (!selected) return [] as readonly { id: string; label: string }[];
    const rows: { id: string; label: string }[] = [
      { id: "intel-overview", label: "Overview" },
    ];
    if (selected.disclosureTimeline && selected.disclosureTimeline.length > 0) {
      rows.push({ id: "intel-timeline", label: "Timeline" });
    }
    if (selected.limitations && selected.limitations.length > 0) {
      rows.push({ id: "intel-limits", label: "Caveats" });
    }
    rows.push({ id: "intel-evidence", label: "Evidence" });
    return rows;
  }, [selected]);

  /** Keep store selection inside the filtered set (e.g. after narrowing search). */
  useLayoutEffect(() => {
    const state = useIncidentStore.getState();
    const list = selectFilteredIncidents(state);
    if (list.length === 0) return;
    const selId = state.selectedIncidentId;
    if (!selId || !list.some((i) => i.id === selId)) {
      state.setSelectedIncidentId(list[0]!.id);
    }
  }, [incidentQuery]);

  useLayoutEffect(() => {
    if (!selected) return;
    setExpandedEvidenceGroups(
      Object.fromEntries(EVIDENCE_GROUP_ORDER.map((g) => [g.key, false]))
    );
    setPanelToast(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when incident id changes only
  }, [selected?.id]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 pt-5 pb-3 border-b border-war-border/60 shrink-0">
        <div className="flex items-center gap-3 border-l-2 border-emerald-300 pl-3">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/75">
            Case library
          </div>
          <span className="text-[10px] text-war-muted/80">
            {incidents.length} documented incidents
          </span>
        </div>

        <div className="mt-4 border border-emerald-400/20 bg-[#07110f] px-4 py-3.5 shadow-[0_16px_38px_rgba(0,0,0,.2)]">
          <div className="mb-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/85">
              Choose an incident
            </p>
            <p className="text-[11px] text-war-muted mt-0.5 leading-relaxed">
              One selection aligns the evidence record, loss model, and
              geographic briefing.
            </p>
          </div>
          <label
            className="mb-1 block font-mono text-[9px] font-semibold uppercase tracking-wide text-emerald-300/65"
            htmlFor="incident-search"
          >
            Filter (optional)
          </label>
          <input
            id="incident-search"
            type="search"
            value={incidentQuery}
            onChange={(e) => setIncidentQuery(e.target.value)}
            placeholder="Type company name, tag, or breach keyword…"
            className="w-full border border-emerald-400/15 bg-black/40 px-3 py-2.5 text-xs text-war-white placeholder:text-war-muted/55 focus:outline-none focus:ring-1 focus:ring-emerald-300/60"
          />
          <label
            className="mb-1.5 mt-3 block font-mono text-[9px] font-semibold uppercase tracking-wide text-emerald-300/65"
            htmlFor="incident-select"
          >
            Incident library
          </label>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] text-war-muted">
              Scroll the list or type to narrow
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold tabular-nums shrink-0">
              {filtered.length === incidents.length
                ? `${filtered.length} cases`
                : `${filtered.length} match`}
            </span>
          </div>
          <select
            id="incident-select"
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            disabled={filtered.length === 0}
            className="[color-scheme:dark] w-full border border-emerald-300/30 bg-black/55 px-3 py-3 text-sm font-medium text-war-white focus:outline-none focus:ring-1 focus:ring-emerald-300/70 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {filtered.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {incidentOptionLabel(inc)}
              </option>
            ))}
          </select>
          {filtered.length === 0 && (
            <p className="text-[11px] text-amber-200/90 mt-2">
              No matches—clear the filter above.
            </p>
          )}
        </div>

        <details className="mt-3 rounded-lg border border-war-border/55 bg-black/45 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-war-muted hover:text-war-white/90 transition-colors">
            <span>Panel tips · map · trust glossary</span>
            <span className="text-[10px] text-war-muted/80 tabular-nums shrink-0 font-normal normal-case tracking-normal">
              optional
            </span>
          </summary>
          <div className="px-2.5 pb-2.5 pt-0 space-y-1.5 border-t border-war-border/35">
            <details className="rounded-md border border-emerald-500/20 bg-black/35 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none px-2 py-1 text-[10px] font-semibold text-emerald-200/90 hover:text-emerald-100">
                Map · scroll order
              </summary>
              <div className="px-2 pb-1.5 text-[10px] text-war-muted/95 leading-snug space-y-1">
                <p>
                  <span className="text-war-white/85 font-medium">
                    Jump bar:{" "}
                  </span>
                  Overview, optional disclosure timeline and caveats, then
                  curated evidence. Evidence groups collapse.
                </p>
                <p>
                  <span className="text-war-white/85 font-medium">
                    Badges:{" "}
                  </span>
                  Trust tiers label provenance—open links in new tabs and verify
                  in primary sources.
                </p>
              </div>
            </details>
            <details className="rounded-md border border-sky-500/20 bg-black/35 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none px-2 py-1 text-[10px] font-semibold text-sky-200/90 hover:text-sky-100">
                How to read links
              </summary>
              <div className="px-2 pb-1.5 text-[10px] text-war-muted/95 leading-snug space-y-1">
                <p>
                  Prefer <span className="text-amber-200/85">issuer</span> /{" "}
                  <span className="text-violet-200/85">regulator</span> before
                  press. Hubs = jump to an index—open the underlying doc next.
                </p>
                <p>
                  <span className="text-war-white/80 font-medium">
                    Report link
                  </span>{" "}
                  copies a correction note if a source URL fails. Center column
                  = teaching model, not a filing.
                </p>
              </div>
            </details>
            <details className="rounded-md border border-violet-500/20 bg-black/35 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer list-none px-2 py-1 text-[10px] font-semibold text-violet-200/90 hover:text-violet-100">
                Trust tiers
              </summary>
              <ul className="px-2 pb-1.5 space-y-1.5 max-h-[40vh] overflow-y-auto">
                {GLOSSARY_TIER_ORDER.map((tier) => {
                  const g = TRUST_TIER_GLOSSARY[tier];
                  return (
                    <li key={tier} className="text-[10px] leading-snug">
                      <div className="font-semibold text-war-white/90">
                        {g.title}
                      </div>
                      <div className="text-emerald-200/75">
                        <span className="text-war-muted">Good: </span>
                        {g.goodFor}
                      </div>
                      <div className="text-rose-200/65">
                        <span className="text-war-muted">Not: </span>
                        {g.notFor}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        </details>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-5 pb-4 pt-4 gap-3">
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto min-h-0 space-y-5 pr-1 scroll-smooth"
        >
          {selected && (
            <>
              <nav
                className="sticky top-0 z-[6] -mx-1 px-1 py-1.5 mb-0.5 bg-gradient-to-b from-black from-65% via-black/92 to-transparent border-b border-war-border/35"
                aria-label="Evidence column sections"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-war-muted mb-1 px-0.5">
                  Jump to
                </p>
                <div className="flex flex-wrap gap-1">
                  {jumpTargets.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goTo(id)}
                      className="rounded-md border border-war-border/55 bg-black/55 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 px-2.5 py-2 text-[11px] sm:text-[12px] font-medium text-sky-100 hover:bg-sky-950/40 hover:border-sky-500/35 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {panelToast && (
                  <p
                    className="mt-1.5 px-0.5 text-[11px] text-war-muted leading-snug"
                    role="status"
                  >
                    {panelToast}
                  </p>
                )}
              </nav>

              <div className="rounded-xl border-2 border-sky-500/50 bg-gradient-to-b from-sky-950/40 to-black/75 px-3 py-3 shadow-[0_0_24px_rgba(56,189,248,0.14)] ring-1 ring-sky-400/20 space-y-3">
                <div className="pb-2 border-b border-sky-500/30">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-200">
                    Case file
                  </p>
                  <p className="text-[10px] text-war-muted mt-0.5 leading-snug">
                    Company context and disclosure milestones — read this block
                    first, then dive into{" "}
                    <span className="text-emerald-200/85">evidence</span> below.
                  </p>
                </div>

                <div id="intel-overview" className="scroll-mt-4 space-y-3">
                  <div className="rounded-lg bg-black/50 border border-sky-500/30 px-3 py-2.5 space-y-1.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80 font-semibold">
                      Company &amp; incident
                    </p>
                    <h2 className="text-sm font-semibold text-war-white leading-snug">
                      {selected.company.name}
                    </h2>
                    <p className="text-[11px] text-war-muted">
                      {selected.company.type}
                      {selected.company.sector
                        ? ` · ${selected.company.sector}`
                        : ""}
                    </p>
                    <p className="text-[11px] text-war-muted/90">
                      <span className="text-war-muted">HQ:</span>{" "}
                      {selected.company.headquartersLabel}
                    </p>
                    <p className="text-xs text-sky-200/90 font-medium pt-0.5">
                      {selected.incidentTitle}
                    </p>
                    <p className="text-[11px] text-war-muted leading-relaxed">
                      {selected.incidentSummary}
                    </p>
                    {selected.taxonomyTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {selected.taxonomyTags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/50 border border-sky-500/25 text-war-muted"
                          >
                            {t.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {selected.company.financials &&
                    (selected.company.financials.isIllustrative ||
                      selected.company.financials.statementNote) && (
                      <div className="rounded-lg border border-amber-500/45 bg-amber-950/25 px-3 py-2.5 space-y-1.5 text-[11px] text-amber-100/90 leading-relaxed">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400/95">
                          Financial snapshot (materiality / globe)
                        </div>
                        {selected.company.financials.isIllustrative && (
                          <p>
                            Figures are{" "}
                            <span className="font-semibold text-amber-200">
                              illustrative or teaching-scale
                            </span>
                            —not cyber-specific loss lines from a filing unless
                            noted.
                          </p>
                        )}
                        {selected.company.financials.statementNote && (
                          <p className="text-amber-100/85">
                            {selected.company.financials.statementNote}
                          </p>
                        )}
                        {selected.company.financials.filingUrl && (
                          <a
                            href={selected.company.financials.filingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sky-300 hover:text-sky-200 underline underline-offset-2 text-[11px] font-medium"
                          >
                            Open cited filing context (EDGAR)
                          </a>
                        )}
                      </div>
                    )}

                  <div className="rounded-lg bg-black/50 border border-sky-500/25 px-3 py-2.5 grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-war-muted mb-0.5">
                        First reported
                      </div>
                      <div className="text-war-white font-medium">
                        {selected.firstReportedLabel}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide text-war-muted mb-0.5">
                        Last updated
                      </div>
                      <div className="text-war-white font-medium">
                        {selected.lastUpdatedLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {selected.disclosureTimeline &&
                  selected.disclosureTimeline.length > 0 && (
                    <div
                      id="intel-timeline"
                      className="scroll-mt-4 rounded-lg bg-black/50 border border-sky-500/25 px-3 py-2.5 space-y-2"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200/80 font-semibold">
                        Disclosure &amp; filing trail
                      </p>
                      <p className="text-[10px] text-war-muted/90 leading-relaxed">
                        Human-readable milestones (not a minute-by-minute IR
                        timeline). Compare gaps between intrusion narrative,
                        public story, and issuer/regulator artifacts.
                      </p>
                      <TimelinePlaybackControls incident={selected} />
                      <ol className="space-y-2.5 list-decimal list-inside marker:text-sky-500/80">
                        {selected.disclosureTimeline.map((ev, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-war-muted leading-relaxed pl-0.5"
                          >
                            <span className="text-war-white font-medium">
                              {ev.label}
                            </span>
                            <span className="text-war-muted">
                              {" "}
                              — {ev.dateLabel}
                            </span>
                            {ev.detail && (
                              <span className="block mt-0.5 text-[10px] text-war-muted/85 pl-4">
                                {ev.detail}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                {selected.limitations && selected.limitations.length > 0 && (
                  <div
                    id="intel-limits"
                    className="scroll-mt-4 rounded-lg border border-rose-500/40 bg-rose-950/20 px-3 py-2.5 space-y-1.5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.15em] text-rose-300/90 font-semibold">
                      What we don’t know
                    </p>
                    <ul className="space-y-1 text-[11px] text-rose-100/85 leading-relaxed list-disc list-inside">
                      {selected.limitations.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div
                id="intel-evidence"
                className="scroll-mt-4 rounded-xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/35 to-black/80 px-3 py-3 sm:px-4 sm:py-4 shadow-[0_0_26px_rgba(16,185,129,0.14)] ring-1 ring-emerald-500/25 space-y-3"
              >
                <div className="pb-2.5 border-b border-emerald-500/35">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200">
                    Source label &amp; evidence trail
                  </p>
                  <p className="text-[11px] text-war-muted mt-1 leading-relaxed">
                    Scan the evidence set first, then open only the source
                    groups you need. Each linked artifact retains its provenance
                    and “why it matters” note.
                  </p>
                </div>
                <EvidenceSourceLabel incident={selected} />
                {EVIDENCE_GROUP_ORDER.map(({ key, label }) => {
                  const items = groupedEvidence.get(key) ?? [];
                  if (items.length === 0) return null;
                  const expanded = expandedEvidenceGroups[key] !== false;
                  return (
                    <div
                      key={key}
                      className="rounded-xl bg-black/50 border border-emerald-500/30 px-3 py-3 sm:px-3.5 space-y-2.5"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEvidenceGroups((prev) => ({
                            ...prev,
                            [key]: !expanded,
                          }))
                        }
                        className="flex w-full items-center justify-between gap-2 text-left rounded-lg border border-emerald-500/35 bg-emerald-950/25 px-2.5 py-2 hover:bg-emerald-950/40 transition-colors"
                        aria-expanded={expanded}
                      >
                        <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-emerald-100/95">
                          {label}
                        </h3>
                        <span className="text-[11px] text-emerald-200/70 tabular-nums shrink-0">
                          {items.length} link{items.length === 1 ? "" : "s"} ·{" "}
                          {expanded ? "hide" : "show"}
                        </span>
                      </button>
                      {expanded && (
                        <ul className="space-y-3.5">
                          {items.map((ev) => {
                            const trust = resolveEvidenceTrust(ev);
                            const isHub = trust.linkRole === "navigation_hub";
                            const dateLine = formatEvidenceDateLine(ev);
                            const retrievedStale =
                              ev.retrievedAt != null &&
                              (() => {
                                const d = daysSinceIso(ev.retrievedAt);
                                return d != null && d > STALE_RETRIEVED_DAYS;
                              })();
                            return (
                              <li
                                key={ev.id}
                                className="rounded-lg border border-emerald-500/25 bg-black/60 p-3.5 shadow-sm shadow-black/20"
                              >
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {typeBadge(ev.type)}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${trustBadgeClass(trust.tier)}`}
                                    title={trust.label}
                                  >
                                    {trust.shortLabel}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${linkRoleBadgeClass(isHub)}`}
                                    title={
                                      isHub
                                        ? "Jumps to search, index, or section front—open the underlying document next."
                                        : "Targets a specific queue, advisory, or document path."
                                    }
                                  >
                                    {isHub
                                      ? "Search / index"
                                      : "Direct doc / queue"}
                                  </span>
                                  {isHub && (
                                    <span className="text-[10px] text-amber-200/80 border border-amber-500/30 rounded px-1.5 py-0.5">
                                      Start here
                                    </span>
                                  )}
                                  {ev.source === "seed" && (
                                    <span className="text-[10px] text-war-muted/70">
                                      curated
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    className="text-[10px] ml-auto text-sky-400/90 hover:text-sky-300 underline"
                                    onClick={() => {
                                      const text = [
                                        "INQUISITION — report link issue",
                                        `incident_id=${selected.id}`,
                                        `evidence_id=${ev.id}`,
                                        `url=${ev.url}`,
                                        `trust=${trust.tier}`,
                                        `link_role=${trust.linkRole}`,
                                        ev.publishedAt
                                          ? `published=${ev.publishedAt}`
                                          : "",
                                        ev.retrievedAt
                                          ? `retrieved=${ev.retrievedAt}`
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join("\n");
                                      void navigator.clipboard.writeText(text);
                                      setPanelToast(
                                        "Copied report snippet to clipboard — paste into email or issue tracker."
                                      );
                                      window.setTimeout(
                                        () => setPanelToast(null),
                                        4000
                                      );
                                    }}
                                  >
                                    Report link
                                  </button>
                                </div>
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[15px] sm:text-base leading-snug text-sky-200 hover:text-sky-100 font-semibold underline underline-offset-[3px] decoration-sky-500/50 hover:decoration-sky-300 break-words block"
                                >
                                  {ev.title}
                                </a>
                                {dateLine && (
                                  <p className="text-[10px] text-war-muted/80 mt-1.5 font-mono leading-relaxed">
                                    {dateLine}
                                  </p>
                                )}
                                {retrievedStale && (
                                  <p className="text-[10px] text-amber-200/85 mt-1">
                                    Captured date is old — confirm the URL still
                                    resolves to the same artifact.
                                  </p>
                                )}
                                {ev.excerpt && (
                                  <p className="text-[11px] text-war-muted mt-2.5 leading-relaxed">
                                    {ev.excerpt}
                                  </p>
                                )}
                                {ev.teach && (
                                  <p className="text-[11px] text-emerald-200/95 mt-3 border-l-[3px] border-emerald-500/60 pl-3 py-1.5 rounded-r-md bg-emerald-950/35 leading-relaxed">
                                    <span className="font-bold text-emerald-300/95">
                                      Why it matters:{" "}
                                    </span>
                                    {ev.teach}
                                  </p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceSourceLabel({ incident }: { incident: Incident }) {
  const tierCounts = incident.evidence.reduce<
    Record<EvidenceTrustTier, number>
  >(
    (counts, evidence) => {
      counts[resolveEvidenceTrust(evidence).tier] += 1;
      return counts;
    },
    {
      issuer_primary: 0,
      regulator_primary: 0,
      litigation_index: 0,
      navigation_hub: 0,
      news_media: 0,
    }
  );

  const sourceMix = [
    tierCounts.issuer_primary > 0
      ? `${tierCounts.issuer_primary} issuer`
      : null,
    tierCounts.regulator_primary > 0
      ? `${tierCounts.regulator_primary} regulator`
      : null,
    tierCounts.litigation_index > 0
      ? `${tierCounts.litigation_index} litigation`
      : null,
    tierCounts.news_media > 0 ? `${tierCounts.news_media} reporting` : null,
    tierCounts.navigation_hub > 0
      ? `${tierCounts.navigation_hub} navigation`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const companyRecord =
    incident.evidence.find(
      (evidence) => resolveEvidenceTrust(evidence).tier === "issuer_primary"
    ) ?? incident.evidence[0];
  const barcodeDigits = (
    incident.company.secCik ?? stableBarcodeNumber(incident.id)
  )
    .replace(/\D/g, "")
    .padStart(10, "0");
  const barcodeBars = barcodePattern(`${incident.id}:${barcodeDigits}`);

  return (
    <section
      className="border-[3px] border-black bg-[#f7f7f1] p-2.5 text-black shadow-[6px_6px_0_rgba(52,211,153,.18)] [font-family:Arial,Helvetica,sans-serif]"
      aria-label="Evidence source facts"
    >
      <div className="border-b-[8px] border-black pb-1">
        <p className="text-[8px] font-bold uppercase leading-none tracking-[0.08em]">
          INQUISITION · CASE EVIDENCE
        </p>
        <h3 className="mt-0.5 text-[32px] font-black leading-[0.92] tracking-[-0.065em]">
          Source Facts
        </h3>
      </div>
      <div className="flex items-end justify-between border-b border-black py-1">
        <span className="text-[9px] font-bold">Evidence per case</span>
        <span className="text-[18px] font-black leading-none">
          {incident.evidence.length}
        </span>
      </div>
      <p className="border-b-[4px] border-black py-1 text-[8px] font-bold leading-[1.15]">
        A compact disclosure of what went into this incident record.
      </p>
      <dl className="text-[10px] leading-[1.15]">
        <LabelRow
          label="Sample source"
          value={sourceMix || "No classified sources"}
          strong
        />
        <LabelRow
          label="Population"
          value={`1 organization · 1 incident narrative · ${incident.company.sector ?? "sector not classified"}`}
        />
        <LabelRow
          label="Time window"
          value={`${incident.firstReportedLabel} → ${incident.lastUpdatedLabel}`}
        />
        <LabelRow
          label="Promotional content"
          value="Not systematically evaluated"
        />
      </dl>
      <p className="border-t-[5px] border-black pt-1 text-[7px] leading-[1.2]">
        * Source classification describes provenance, not truthfulness. Open the
        underlying artifacts before relying on a claim.
      </p>
      {companyRecord && (
        <a
          href={companyRecord.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block border-t border-black pt-1 text-black no-underline"
          title={`Trace ${incident.company.name} to its source record`}
          aria-label={`Open the primary company record for ${incident.company.name}`}
        >
          <svg
            viewBox="0 0 240 42"
            className="h-9 w-full"
            role="img"
            aria-label={`Source barcode for ${incident.company.name}`}
          >
            <rect width="240" height="42" fill="#f7f7f1" />
            {barcodeBars.map((bar, index) => (
              <rect
                key={index}
                x={bar.x}
                y="1"
                width={bar.width}
                height={bar.tall ? 31 : 27}
                fill="#000"
              />
            ))}
            <text
              x="120"
              y="40"
              textAnchor="middle"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="7"
              letterSpacing="3"
              fill="#000"
            >
              {barcodeDigits}
            </text>
          </svg>
        </a>
      )}
      <p className="mt-1 border-t border-black pt-1 text-[7px] leading-[1.2] text-black/75">
        Source-label concept adapted from{" "}
        <a
          href="https://www.linkedin.com/posts/tonymartinvegue_if-i-were-in-charge-of-things-every-security-activity-7459634581730693120-kOrP"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline"
        >
          Tony Martin-Vegue’s five-field security-report test
        </a>
        . Counts describe this case record; they do not score source
        truthfulness.
      </p>
    </section>
  );
}

function stableBarcodeNumber(value: string): string {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return String(hash >>> 0);
}

function barcodePattern(
  value: string
): { x: number; width: number; tall: boolean }[] {
  const bars: { x: number; width: number; tall: boolean }[] = [];
  let state = Number(stableBarcodeNumber(value));
  let x = 4;
  let index = 0;
  while (x < 236) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const width = 1 + (state % 3);
    bars.push({ x, width, tall: index < 3 || x > 225 || index % 11 === 0 });
    x += width + 1 + ((state >>> 8) % 2);
    index += 1;
  }
  return bars;
}

function LabelRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[6.8rem_1fr] gap-2 border-b border-black py-1.5 last:border-b-0">
      <dt className="font-extrabold">{label}</dt>
      <dd className={`text-right ${strong ? "font-black" : "font-semibold"}`}>
        {value}
      </dd>
    </div>
  );
}

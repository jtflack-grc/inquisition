import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopologyJson from "world-atlas/countries-110m.json";
import type { Incident } from "../inquisition/types";
import { resolveGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";

interface CountryFeature {
  type: "Feature";
  properties: { name: string };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

const countriesTopology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;
const COUNTRY_FEATURES = feature(
  countriesTopology,
  countriesTopology.objects.countries
).features as CountryFeature[];

/** ISO 3166-1 alpha-2 → GeoJSON `properties.name` variants (subset). */
const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ["United States of America", "United States", "USA"],
  GB: [
    "United Kingdom",
    "UK",
    "United Kingdom of Great Britain and Northern Ireland",
  ],
  CA: ["Canada"],
  DE: ["Germany"],
  FR: ["France"],
  JP: ["Japan", "Nippon"],
  CN: ["China"],
  AU: ["Australia"],
  IN: ["India"],
  BR: ["Brazil"],
  DK: ["Denmark"],
};

type GlobePoint = {
  lat: number;
  lng: number;
  id: string;
  label: string;
  incident: Incident;
};

function isHighlightCountry(
  feature: CountryFeature,
  code: string | undefined,
  canonicalHint: string
): boolean {
  if (!code) return false;
  const name = feature.properties.name;
  const aliases = COUNTRY_ALIASES[code] ?? [canonicalHint].filter(Boolean);
  if (aliases.length === 0) return false;
  return aliases.some(
    (alias) => alias === name || name.includes(alias) || alias.includes(name)
  );
}

export function ScenarioGlobe() {
  const incidents = useIncidentStore((s) => s.incidents);
  const selectedId = useIncidentStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useIncidentStore(
    (s) => s.setSelectedIncidentId
  );
  const selected = useIncidentStore(selectSelectedIncident);

  // react-globe.gl ref typing expects library GlobeMethods; keep loose ref for pointOfView access
  const globeRef = useRef<{
    pointOfView: (
      pos: { lat: number; lng: number; altitude: number },
      ms?: number
    ) => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 640, h: 480 });
  const [showPopup, setShowPopup] = useState(true);

  const pointsData = useMemo<GlobePoint[]>(() => {
    return incidents
      .filter(
        (i) =>
          Number.isFinite(i.company.hqLat) && Number.isFinite(i.company.hqLon)
      )
      .map((i) => ({
        lat: i.company.hqLat,
        lng: i.company.hqLon,
        id: i.id,
        label: i.company.name,
        incident: i,
      }));
  }, [incidents]);

  const ringsData = useMemo(() => {
    if (!selected) return [];
    return [
      {
        lat: selected.company.hqLat,
        lng: selected.company.hqLon,
        maxRadius: 2,
        propagationSpeed: 0.5,
      },
    ];
  }, [selected]);

  const countryCode = selected?.company.countryCode;
  const countryHint = selected?.company.headquartersLabel ?? "";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.max(200, Math.floor(r.width));
      const h = Math.max(200, Math.floor(r.height));
      setDims({ w, h });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setDims({
      w: Math.max(200, Math.floor(rect.width)),
      h: Math.max(200, Math.floor(rect.height)),
    });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe?.pointOfView || !selected) return;
    globe.pointOfView(
      {
        lat: selected.company.hqLat,
        lng: selected.company.hqLon,
        altitude: 2.0,
      },
      1000
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- POV when HQ coords / incident id change
  }, [selected?.company.hqLat, selected?.company.hqLon, selected?.id]);

  useEffect(() => {
    setShowPopup(true);
  }, [selected?.id]);

  useEffect(() => {
    if (!showPopup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPopup(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showPopup]);

  const fin = selected?.company.financials;
  const globeLesson = selected ? resolveGlobeSecurityLesson(selected) : null;

  return (
    <div
      ref={containerRef}
      className="globe-field relative w-full h-full min-h-[320px] bg-[#020806]"
    >
      <div className="relative z-10 w-full h-full">
        <Globe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-globe.gl ref is GlobeMethods
          ref={globeRef as any}
          width={dims.w}
          height={dims.h}
          backgroundColor="rgba(2,6,23,0)"
          globeImageUrl="./earth-dark.svg"
          polygonsData={COUNTRY_FEATURES}
          polygonAltitude={(d: object) =>
            isHighlightCountry(d as CountryFeature, countryCode, countryHint)
              ? 0.06
              : 0.01
          }
          polygonCapColor={(d: object) =>
            isHighlightCountry(d as CountryFeature, countryCode, countryHint)
              ? "rgba(239,68,68,0.95)"
              : "rgba(30,64,175,0.65)"
          }
          polygonSideColor={() => "rgba(15,23,42,0.9)"}
          polygonStrokeColor={() => "rgba(15,23,42,0.9)"}
          atmosphereColor="rgb(96,165,250)"
          atmosphereAltitude={0.18}
          showAtmosphere
          onPolygonClick={(d: object) => {
            if (
              isHighlightCountry(d as CountryFeature, countryCode, countryHint)
            ) {
              setShowPopup((prev) => !prev);
            }
          }}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointLabel="label"
          pointColor={(d: object) =>
            (d as GlobePoint).id === selectedId
              ? "rgba(250,204,21,1)"
              : "rgba(59,130,246,1)"
          }
          pointAltitude={0.15}
          pointRadius={(d: object) =>
            (d as GlobePoint).id === selectedId ? 0.65 : 0.45
          }
          pointResolution={16}
          onPointClick={(point: object) => {
            const p = point as GlobePoint;
            setSelectedIncidentId(p.id);
            setShowPopup(true);
          }}
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringMaxRadius="maxRadius"
          ringPropagationSpeed="propagationSpeed"
          ringColor={() => "rgba(96,165,250,0.6)"}
          ringAltitude={0.12}
        />
      </div>

      {showPopup && selected && globeLesson && (
        <div
          className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-[min(22rem,calc(100%-1rem))] max-h-[min(85vh,560px)] overflow-y-auto rounded-2xl bg-gradient-to-b from-black/95 to-[#020617]/95 border-2 border-war-border/80 px-4 py-4 sm:px-5 sm:py-5 backdrop-blur-xl shadow-2xl z-20"
          role="dialog"
          aria-label="Incident and HQ details"
        >
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-war-border/50">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.2em] uppercase text-emerald-400 mb-1 font-semibold truncate">
                {selected.company.headquartersLabel}
              </div>
              <div className="text-xl font-bold text-war-white mb-1">
                {selected.company.name}
              </div>
              <p className="text-xs text-war-muted">
                {selected.company.sector ?? selected.company.type}
              </p>
              <p className="text-[11px] text-sky-200/90 mt-2 leading-relaxed">
                {selected.incidentTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="text-war-muted hover:text-war-white transition-colors p-1 shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-war-border/60 bg-black/45 px-3 py-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-war-muted">
                Summary
              </h3>
              <div className="text-war-white/90 leading-relaxed text-[11px]">
                {selected.incidentSummary}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-war-border/30">
                <div>
                  <span className="text-war-muted">First reported: </span>
                  <span className="text-war-white">
                    {selected.firstReportedLabel}
                  </span>
                </div>
                <div>
                  <span className="text-war-muted">Updated: </span>
                  <span className="text-war-white">
                    {selected.lastUpdatedLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-war-border/60 bg-black/45 px-3 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-war-muted mb-2">
                Company
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-war-muted text-[10px] mb-0.5">
                    Headquarters
                  </div>
                  <div className="text-war-white font-medium text-[11px] leading-snug">
                    {selected.company.headquartersLabel}
                  </div>
                </div>
                <div>
                  <div className="text-war-muted text-[10px] mb-0.5">Type</div>
                  <div className="text-war-white font-medium">
                    {selected.company.type}
                  </div>
                </div>
                {selected.company.employeeCount != null && (
                  <div>
                    <div className="text-war-muted text-[10px] mb-0.5">
                      Employees
                    </div>
                    <div className="text-war-white font-medium">
                      {selected.company.employeeCount.toLocaleString()}
                    </div>
                  </div>
                )}
                {selected.company.foundedYear != null && (
                  <div>
                    <div className="text-war-muted text-[10px] mb-0.5">
                      Founded
                    </div>
                    <div className="text-war-white font-medium">
                      {selected.company.foundedYear}
                    </div>
                  </div>
                )}
                {selected.company.secCik && (
                  <div className="col-span-2">
                    <div className="text-war-muted text-[10px] mb-0.5">
                      SEC CIK
                    </div>
                    <div className="text-war-white font-medium font-mono text-[11px]">
                      {selected.company.secCik}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-war-border/60 bg-black/45 px-3 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-war-muted mb-3">
                Financial snapshot
              </h3>
              {fin?.isIllustrative && (
                <div className="mb-2 rounded-lg border border-amber-500/40 bg-amber-950/25 px-2 py-1.5 text-[9px] text-amber-100/90">
                  Illustrative scale for materiality teaching—not filed cyber
                  loss lines. Confirm in {fin.filingForm ?? "SEC"} filings.
                </div>
              )}
              {fin?.fiscalYearLabel && (
                <p className="text-[10px] text-war-muted mb-2">
                  {fin.fiscalYearLabel}
                  {!fin.isIllustrative ? " — from public filings (verify)" : ""}
                </p>
              )}
              {fin?.statementNote && (
                <p className="text-[9px] text-war-muted/90 mb-2 leading-relaxed">
                  {fin.statementNote}
                </p>
              )}
              {fin?.filingUrl && (
                <a
                  href={fin.filingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] text-sky-400 hover:text-sky-300 underline mb-2"
                >
                  Open cited filing index / document →
                </a>
              )}
              {fin?.filingAccessionNumber && (
                <p className="text-[9px] text-war-muted font-mono mb-2">
                  Accession: {fin.filingAccessionNumber}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-black/40 p-2 border border-war-border/30">
                  <div className="text-war-muted text-[10px] mb-1">Revenue</div>
                  <div className="text-lg font-bold text-war-white">
                    {fin?.revenueUSDm != null
                      ? `$${fin.revenueUSDm.toLocaleString()}M`
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2 border border-war-border/30">
                  <div className="text-war-muted text-[10px] mb-1">EBITDA</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {fin?.ebitdaUSDm != null
                      ? `$${fin.ebitdaUSDm.toLocaleString()}M`
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2 border border-war-border/30 col-span-2">
                  <div className="text-war-muted text-[10px] mb-1">
                    Net income
                  </div>
                  <div className="text-base font-bold text-war-white">
                    {fin?.netIncomeUSDm != null
                      ? `$${fin.netIncomeUSDm.toLocaleString()}M`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-3 py-3 space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300/95">
                Attack type &amp; mechanics
              </h3>
              <p className="text-[11px] text-war-white/90 leading-relaxed">
                {globeLesson.attackMechanism}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/15 px-3 py-3 space-y-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/95">
                Case-specific analysis
              </h3>
              <p className="text-[10px] text-amber-50/90 leading-relaxed">
                {globeLesson.caseAnalysis}
              </p>
            </div>

            {(globeLesson.identification.length > 0 ||
              globeLesson.prevention.length > 0) && (
              <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-3 py-3 space-y-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300/95">
                  Detection &amp; prevention (taxonomy-backed)
                </h3>
                {globeLesson.identification.length > 0 && (
                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-war-muted mb-1">
                      Identification &amp; detection
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[10px] text-sky-100/90 leading-relaxed">
                      {globeLesson.identification.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {globeLesson.prevention.length > 0 && (
                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-war-muted mb-1">
                      Prevention &amp; hardening
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[10px] text-emerald-100/88 leading-relaxed">
                      {globeLesson.prevention.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-sky-500/45 bg-sky-950/20 px-3 py-3 space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-200/95">
                Response &amp; mitigation priorities
              </h3>
              <p className="text-[9px] text-war-muted/90 leading-relaxed">
                Tailored to this incident profile—execute with your IR retainer,
                legal, and business continuity leads.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[10px] text-sky-50/92 leading-relaxed">
                {globeLesson.mitigationPriority.map((line, i) => (
                  <li key={i} className="pl-0.5 marker:text-sky-400/90">
                    {line}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-war-border/50 bg-black/30 px-3 py-2.5 space-y-1">
              <p className="text-[9px] text-war-muted/85 leading-relaxed">
                <span className="text-war-white/70 font-medium">
                  Injection-style apps (SQL/LDAP/OS):{" "}
                </span>
                parameterized queries / safe APIs, input validation,
                least-privilege data access, and WAF baselines — even when this
                case was not injection-led.
              </p>
              {globeLesson.mergedTaxonomyHints && (
                <p className="text-[9px] text-war-muted/70 italic">
                  Identification/prevention lists include extra bullets from
                  this incident&apos;s taxonomy tags (merged with any
                  curator-written notes).
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Component, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopologyJson from "world-atlas/countries-110m.json";
import { resolveGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import { ScenarioGlobeFallback } from "./ScenarioGlobeFallback";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import { useTimelinePlaybackStore } from "../store/timelinePlaybackStore";

// A single optional equirectangular texture, NOT an elevation or tiled imagery service.
// The locally bundled charcoal globe is always the default and works offline.
const SATELLITE_TEXTURE =
  "https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-blue-marble.jpg";

interface CountryFeature {
  type: "Feature";
  properties: { name: string };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}
interface GlobePoint {
  lat: number;
  lng: number;
  id: string;
  label: string;
  title: string;
}

interface GlobeMethods {
  pointOfView: (
    point: { lat: number; lng: number; altitude: number },
    durationMs?: number
  ) => void;
  controls: () => { autoRotate: boolean };
}

const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;
const COUNTRIES = feature(topology, topology.objects.countries)
  .features as CountryFeature[];

const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ["United States of America", "United States", "USA"],
  GB: ["United Kingdom", "UK", "United Kingdom of Great Britain and Northern Ireland"],
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

function isSelectedCountry(
  country: CountryFeature,
  code: string | undefined,
  headquarters: string
): boolean {
  if (!code) return false;
  const name = country.properties.name;
  const aliases = COUNTRY_ALIASES[code] ?? [headquarters].filter(Boolean);
  return aliases.some((candidate) =>
    candidate === name || name.includes(candidate) || candidate.includes(name)
  );
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") || canvas.getContext("webgl");
    return Boolean(context);
  } catch {
    return false;
  }
}

/** Render-time errors fall back to the existing offline SVG navigator. */
class GlobeErrorBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("3D case globe unavailable; using 2D navigator.", error);
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function ScenarioGlobe() {
  const incidents = useIncidentStore((s) => s.incidents);
  const selectedId = useIncidentStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useIncidentStore((s) => s.setSelectedIncidentId);
  const selected = useIncidentStore(selectSelectedIncident);
  const playbackIncidentId = useTimelinePlaybackStore((s) => s.incidentId);
  const playbackStep = useTimelinePlaybackStore((s) => s.step);
  const playbackPlaying = useTimelinePlaybackStore((s) => s.playing);
  const [showPopup, setShowPopup] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [dims, setDims] = useState({ w: 640, h: 480 });
  const [globeReady, setGlobeReady] = useState(false);
  const [mapError, setMapError] = useState(!supportsWebGL());
  const [satelliteRequested, setSatelliteRequested] = useState(false);
  const [satelliteReady, setSatelliteReady] = useState(false);
  const [satelliteUnavailable, setSatelliteUnavailable] = useState(false);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(null);

  const hotspots = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          Number.isFinite(incident.company.hqLat) &&
          Number.isFinite(incident.company.hqLon)
      ),
    [incidents]
  );
  const points = useMemo<GlobePoint[]>(
    () =>
      hotspots.map((incident) => ({
        lat: incident.company.hqLat,
        lng: incident.company.hqLon,
        id: incident.id,
        label: incident.company.name,
        title: incident.incidentTitle,
      })),
    [hotspots]
  );
  const selectedPoint = points.find((point) => point.id === selectedId) ?? null;
  const hoveredIncident =
    hotspots.find((incident) => incident.id === hoveredIncidentId) ?? null;

  const playbackEvent = useMemo(() => {
    if (!selected || playbackIncidentId !== selected.id || playbackStep == null)
      return null;
    const timeline = selected.disclosureTimeline ?? [];
    const event = timeline[playbackStep];
    if (!event) return null;
    return { event, index: playbackStep, total: timeline.length };
  }, [playbackIncidentId, playbackStep, selected]);

  // Fit the globe to its own stage (not the entire browser window).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const { width, height } = stage.getBoundingClientRect();
      setDims({
        w: Math.max(200, Math.floor(width)),
        h: Math.max(200, Math.floor(height)),
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL context lost; switching to offline case map.");
      setMapError(true);
    };
    node.addEventListener("webglcontextlost", handleContextLoss, true);
    return () => node.removeEventListener("webglcontextlost", handleContextLoss, true);
  }, []);

  // Satellite mode is opt-in; preflight the image so failure leaves the
  // locally bundled default intact.
  useEffect(() => {
    if (!satelliteRequested) return;
    let active = true;
    const texture = new Image();
    texture.crossOrigin = "anonymous";
    texture.onload = () => {
      if (active) {
        setSatelliteReady(true);
        setSatelliteUnavailable(false);
      }
    };
    texture.onerror = () => {
      if (active) {
        setSatelliteReady(false);
        setSatelliteRequested(false);
        setSatelliteUnavailable(true);
      }
    };
    texture.src = SATELLITE_TEXTURE;
    return () => {
      active = false;
    };
  }, [satelliteRequested]);

  useEffect(() => {
    if (!selected || !globeReady || mapError) return;
    globeRef.current?.pointOfView(
      {
        lat: selected.company.hqLat,
        lng: selected.company.hqLon,
        altitude: 1.95,
      },
      950
    );
  }, [selected?.id, selected?.company.hqLat, selected?.company.hqLon, globeReady, mapError]);

  // During an evidence timeline replay, the timeline callout takes precedence.
  useEffect(() => {
    setShowPopup(!playbackEvent);
  }, [selectedId, playbackEvent]);

  useEffect(() => {
    if (!showPopup) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPopup(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showPopup]);

  const rings = useMemo(
    () =>
      selectedPoint
        ? [
            { lat: selectedPoint.lat, lng: selectedPoint.lng, maxRadius: playbackEvent ? 4.2 : 2.7, speed: 1.15 },
            { lat: selectedPoint.lat, lng: selectedPoint.lng, maxRadius: playbackEvent ? 3.0 : 2.0, speed: 0.75 },
          ]
        : [],
    [selectedPoint?.id, selectedPoint?.lat, selectedPoint?.lng, playbackEvent]
  );
  const fin = selected?.company.financials;
  const globeLesson = selected ? resolveGlobeSecurityLesson(selected) : null;
  const satelliteActive = satelliteReady && satelliteRequested;
  const countryCode = selected?.company.countryCode;
  const headquarters = selected?.company.headquartersLabel ?? "";
  const chooseIncident = (id: string) => {
    setSelectedIncidentId(id);
    setShowPopup(true);
  };

  return (
    <div className="globe-field relative w-full h-full min-h-[320px] bg-black overflow-hidden">
      <div className="globe-map-stage" ref={stageRef}>
        {mapError ? (
          <ScenarioGlobeFallback
            hotspots={hotspots}
            selectedId={selectedId}
            onSelect={chooseIncident}
          />
        ) : (
          <GlobeErrorBoundary onFailure={() => setMapError(true)}>
            <Globe
              ref={globeRef as never}
              width={dims.w}
              height={dims.h}
              animateIn={false}
              waitForGlobeReady={false}
              backgroundColor="#050709"
              globeImageUrl={satelliteActive ? SATELLITE_TEXTURE : "./earth-dark.svg"}
              polygonsData={COUNTRIES}
              polygonAltitude={(item: object) =>
                isSelectedCountry(item as CountryFeature, countryCode, headquarters) ? 0.015 : 0.004
              }
              polygonCapColor={(item: object) =>
                isSelectedCountry(item as CountryFeature, countryCode, headquarters)
                  ? "rgba(224,107,107,0.32)"
                  : satelliteActive
                    ? "rgba(20,25,30,0.025)"
                    : "rgba(52,60,67,0.95)"
              }
              polygonSideColor={() => "rgba(18,23,28,0.7)"}
              polygonStrokeColor={() => satelliteActive ? "rgba(120,140,150,0.25)" : "rgba(104,119,130,0.58)"}
              showAtmosphere
              atmosphereColor="#607280"
              atmosphereAltitude={0.10}
              onPolygonClick={(item: object) => {
                if (isSelectedCountry(item as CountryFeature, countryCode, headquarters))
                  setShowPopup((open) => !open);
              }}
              pointsData={points}
              pointLat="lat"
              pointLng="lng"
              pointLabel="label"
              pointColor={(item: object) =>
                (item as GlobePoint).id === selectedId ? "#e06b6b" : "#7ea4bf"
              }
              pointAltitude={(item: object) =>
                (item as GlobePoint).id === selectedId ? 0.065 : 0.038
              }
              pointRadius={(item: object) =>
                (item as GlobePoint).id === selectedId ? 0.6 : 0.37
              }
              pointResolution={14}
              onPointClick={(item: object) => chooseIncident((item as GlobePoint).id)}
              onPointHover={(item: object | null) => setHoveredIncidentId((item as GlobePoint | null)?.id ?? null)}
              labelsData={selectedPoint ? [selectedPoint] : []}
              labelLat="lat"
              labelLng="lng"
              labelText="label"
              labelColor={() => "#e7ecf0"}
              labelAltitude={0.095}
              labelSize={0.68}
              labelDotRadius={0}
              labelResolution={2}
              onLabelClick={() => setShowPopup(true)}
              ringsData={rings}
              ringLat="lat"
              ringLng="lng"
              ringMaxRadius="maxRadius"
              ringPropagationSpeed="speed"
              ringRepeatPeriod={1750}
              ringColor={() => ["rgba(224,107,107,0.85)", "rgba(224,107,107,0.05)"]}
              ringAltitude={0.02}
              ringResolution={72}
              onGlobeReady={() => {
                setGlobeReady(true);
                if (globeRef.current) globeRef.current.controls().autoRotate = false;
              }}
            />
          </GlobeErrorBoundary>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end items-center gap-2">
          <span className="rounded border border-white/15 bg-black/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-300">
            {hotspots.length} cases · {mapError ? "2D backup" : satelliteActive ? "satellite texture" : "charcoal globe"}
          </span>
          {!mapError && (
            <button
              type="button"
              onClick={() => {
                setSatelliteRequested((current) => !current);
                setSatelliteUnavailable(false);
              }}
              className="rounded border border-white/20 bg-black/85 px-2.5 py-1.5 font-mono text-[10px] text-slate-200 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-200"
              aria-pressed={satelliteRequested}
              aria-label={satelliteRequested ? "Use charcoal map texture" : "Use optional satellite image texture"}
            >
              {satelliteRequested ? (satelliteReady ? "Charcoal view" : "Loading satellite…") : "Satellite view"}
            </button>
          )}
        </div>
        {satelliteUnavailable && !mapError && (
          <p className="absolute right-3 top-12 z-10 bg-black/90 p-2 text-[10px] text-amber-200">
            Satellite image unavailable; charcoal globe retained.
          </p>
        )}
        {hoveredIncident && hoveredIncident.id !== selectedId && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[260px] rounded border border-white/15 bg-black/85 px-3 py-2">
            <div className="text-xs font-medium text-white">{hoveredIncident.company.name}</div>
            <div className="mt-0.5 text-[10px] text-slate-400">{hoveredIncident.incidentTitle}</div>
          </div>
        )}
        {playbackEvent && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 w-[min(28rem,calc(100%-2rem))] border border-rose-400/45 bg-black/90 px-4 py-3">
            <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-rose-300/85">
              <span>Case replay · {playbackEvent.index + 1}/{playbackEvent.total}</span>
              <span>{playbackPlaying ? "Playing" : "Paused"}</span>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-400">{playbackEvent.event.dateLabel}</div>
            <div className="mt-0.5 text-sm font-semibold text-white">{playbackEvent.event.label}</div>
            {playbackEvent.event.detail && (
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{playbackEvent.event.detail}</p>
            )}
          </div>
        )}
      </div>

      {showPopup && selected && globeLesson && (
        <div
          key={selected.id}
          className="case-briefing pointer-events-auto"
          role="dialog"
          aria-label="Incident case briefing"
          aria-modal="false"
        >
          <div className="case-briefing__head flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.12em] uppercase text-emerald-400 mb-1 font-semibold">
                CASE BRIEFING / {selected.company.headquartersLabel}
              </div>
              <h2 className="text-lg font-semibold text-war-white mb-1">
                {selected.company.name}
              </h2>
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
              className="case-briefing__close text-war-muted hover:text-war-white transition-colors shrink-0"
              aria-label="Close case briefing to expand globe"
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
              <span>Expand map</span>
            </button>
          </div>

          <div className="case-briefing__body text-xs">
            <div className="case-briefing__grid">
              <div className="case-briefing__column">
                <div className="case-briefing__section space-y-2">
                  <h3 className="text-xs font-semibold text-war-muted">
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

                <div className="case-briefing__section">
                  <h3 className="text-xs font-semibold text-war-muted mb-2">
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
                      <div className="text-war-muted text-[10px] mb-0.5">
                        Type
                      </div>
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

                <div className="case-briefing__section">
                  <h3 className="text-xs font-semibold text-war-muted mb-3">
                    Financial snapshot
                  </h3>
                  {fin?.isIllustrative && (
                    <div className="mb-2 rounded-lg border border-amber-500/40 bg-amber-950/25 px-2 py-1.5 text-[9px] text-amber-100/90">
                      Illustrative scale for materiality teaching—not filed
                      cyber loss lines. Confirm in {fin.filingForm ?? "SEC"}{" "}
                      filings.
                    </div>
                  )}
                  {fin?.fiscalYearLabel && (
                    <p className="text-[10px] text-war-muted mb-2">
                      {fin.fiscalYearLabel}
                      {!fin.isIllustrative
                        ? " — from public filings (verify)"
                        : ""}
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
                      <div className="text-war-muted text-[10px] mb-1">
                        Revenue
                      </div>
                      <div className="text-lg font-semibold font-mono text-war-white">
                        {fin?.revenueUSDm != null
                          ? `$${fin.revenueUSDm.toLocaleString()}M`
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-2 border border-war-border/30">
                      <div className="text-war-muted text-[10px] mb-1">
                        EBITDA
                      </div>
                      <div className="text-lg font-semibold font-mono text-emerald-400">
                        {fin?.ebitdaUSDm != null
                          ? `$${fin.ebitdaUSDm.toLocaleString()}M`
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-2 border border-war-border/30 col-span-2">
                      <div className="text-war-muted text-[10px] mb-1">
                        Net income
                      </div>
                      <div className="text-base font-semibold font-mono text-war-white">
                        {fin?.netIncomeUSDm != null
                          ? `$${fin.netIncomeUSDm.toLocaleString()}M`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="case-briefing__column">
                <div className="case-briefing__section space-y-2">
                  <h3 className="text-[10px] font-semibold text-violet-300/95">
                    Attack type & mechanics
                  </h3>
                  <p className="text-[11px] text-war-white/90 leading-relaxed">
                    {globeLesson.attackMechanism}
                  </p>
                </div>

                <div className="case-briefing__section space-y-1.5">
                  <h3 className="text-[10px] font-semibold text-amber-200/95">
                    Case-specific analysis
                  </h3>
                  <p className="text-[10px] text-amber-50/90 leading-relaxed">
                    {globeLesson.caseAnalysis}
                  </p>
                </div>
              </div>
              <div className="case-briefing__column">
                {(globeLesson.identification.length > 0 ||
                  globeLesson.prevention.length > 0) && (
                  <div className="case-briefing__section space-y-2">
                    <h3 className="text-[10px] font-semibold text-violet-300/95">
                      Detection & prevention
                    </h3>
                    {globeLesson.identification.length > 0 && (
                      <div>
                        <div className="text-[9px] text-war-muted mb-1">
                          Identification & detection
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-sky-100/90 leading-relaxed">
                          {globeLesson.identification.map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {globeLesson.prevention.length > 0 && (
                      <div>
                        <div className="text-[9px] text-war-muted mb-1">
                          Prevention & hardening
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-[10px] text-emerald-100/90 leading-relaxed">
                          {globeLesson.prevention.map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="case-briefing__section space-y-2">
                  <h3 className="text-[10px] font-semibold text-sky-200/95">
                    Response & mitigation priorities
                  </h3>
                  <p className="text-[9px] text-war-muted/90 leading-relaxed">
                    Tailored to this incident profile—execute with your IR
                    retainer, legal, and business continuity leads.
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[10px] text-sky-50/90 leading-relaxed">
                    {globeLesson.mitigationPriority.map((line, index) => (
                      <li key={index} className="pl-0.5 marker:text-sky-400/90">
                        {line}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="case-briefing__section case-briefing__note space-y-1">
                  <p className="text-[9px] text-war-muted/85 leading-relaxed">
                    <span className="text-war-white/70 font-medium">
                      Injection-style apps (SQL/LDAP/OS):{" "}
                    </span>
                    parameterized queries / safe APIs, input validation,
                    least-privilege data access, and WAF baselines — even when
                    this case was not injection-led.
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
          </div>
        </div>
      )}
    </div>
  );
}

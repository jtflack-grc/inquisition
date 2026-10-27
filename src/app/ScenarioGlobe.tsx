import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import Globe from "react-globe.gl";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopologyJson from "world-atlas/countries-110m.json";
import { resolveGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import { ScenarioGlobeFallback } from "./ScenarioGlobeFallback";
import { resolveMapPlacard } from "./globeCasePlacard";
import { supportsWebGL } from "./webglSupport";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";
import { useTimelinePlaybackStore } from "../store/timelinePlaybackStore";

// Detailed imagery uses one static texture, never live elevation or imagery tiles.
// The bundled charcoal texture remains the reliable offline fallback.
const NIGHT_TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const SATELLITE_TEXTURE =
  "https://cdn.jsdelivr.net/npm/three-globe@2.45.2/example/img/earth-blue-marble.jpg";

// INHERITANCE's 1.4-altitude opening view filled a full-height panel.
// INQUISITION's globe shares its rail with a case dossier: frame it closer.
// Camera is now initialized before the 3D scene is revealed, so we can use a
// readable mid-distance frame without the old library-default fly-in.
const DEFAULT_FOCUS_ALTITUDE = 0.58;
const MIN_FOCUS_ALTITUDE = 0.1;
const MAX_FOCUS_ALTITUDE = 2.1;

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
  pulseDelay: number;
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
  GB: [
    "England", // INHERITANCE world.geojson labels GBR as England.
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

function isSelectedCountry(
  country: CountryFeature,
  code: string | undefined,
  headquarters: string
): boolean {
  if (!code) return false;
  const name = country.properties.name;
  const aliases = COUNTRY_ALIASES[code] ?? [headquarters].filter(Boolean);
  return aliases.some(
    (candidate) =>
      candidate === name || name.includes(candidate) || candidate.includes(name)
  );
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
  const setSelectedIncidentId = useIncidentStore(
    (s) => s.setSelectedIncidentId
  );
  const selected = useIncidentStore(selectSelectedIncident);
  const playbackIncidentId = useTimelinePlaybackStore((s) => s.incidentId);
  const playbackStep = useTimelinePlaybackStore((s) => s.step);
  const playbackPlaying = useTimelinePlaybackStore((s) => s.playing);
  const [showPopup, setShowPopup] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | null>(null);
  const [dims, setDims] = useState({ w: 640, h: 480 });
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const cameraInitializedRef = useRef(false);
  const lastCameraCaseRef = useRef<string | null>(null);
  const lastCameraAltitudeRef = useRef<number | null>(null);
  // Lazy initialization matters: calling supportsWebGL() directly in the
  // useState argument allocates a new context on *every* React re-render.
  // That can evict the actual globe context and trigger the 2D fallback.
  const [mapError, setMapError] = useState(() => !supportsWebGL());
  const [countries, setCountries] = useState<CountryFeature[]>(COUNTRIES);
  const [nightTextureReady, setNightTextureReady] = useState(false);
  const [cameraAltitude, setCameraAltitude] = useState(DEFAULT_FOCUS_ALTITUDE);
  const [satelliteRequested, setSatelliteRequested] = useState(false);
  const [satelliteReady, setSatelliteReady] = useState(false);
  const [satelliteUnavailable, setSatelliteUnavailable] = useState(false);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(
    null
  );

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
      hotspots.map((incident, index) => ({
        lat: incident.company.hqLat,
        lng: incident.company.hqLon,
        id: incident.id,
        label: incident.company.name,
        title: incident.incidentTitle,
        pulseDelay: -(index % 11) * 0.29,
      })),
    [hotspots]
  );
  const selectedPoint = points.find((point) => point.id === selectedId) ?? null;
  const hoveredIncident =
    hotspots.find((incident) => incident.id === hoveredIncidentId) ?? null;
  // Show the selected case from first render; hovering another pulse previews it.
  const mapPlacard = resolveMapPlacard(selected, hoveredIncident);
  const placardCaseNumber = mapPlacard
    ? incidents.findIndex(
        (incident) => incident.id === mapPlacard.incident.id
      ) + 1
    : 0;

  const playbackEvent = useMemo(() => {
    if (!selected || playbackIncidentId !== selected.id || playbackStep == null)
      return null;
    const timeline = selected.disclosureTimeline ?? [];
    const event = timeline[playbackStep];
    if (!event) return null;
    return { event, index: playbackStep, total: timeline.length };
  }, [playbackIncidentId, playbackStep, selected]);

  // INHERITANCE uses the fuller, 10k-vertex world.geojson geometry.
  // Keep the bundled atlas as an offline fallback if the detailed data fails.
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}world-detailed.geojson`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((collection: { features?: CountryFeature[] }) => {
        if (
          Array.isArray(collection.features) &&
          collection.features.length > 0
        )
          setCountries(collection.features);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          console.warn(
            "Detailed globe geography unavailable; using bundled atlas.",
            error
          );
      });
    return () => controller.abort();
  }, []);

  // Borrow the Earth-at-night texture from INHERITANCE, without making the
  // rest of INQUISITION depend on the remote image loading successfully.
  useEffect(() => {
    let active = true;
    const texture = new Image();
    texture.crossOrigin = "anonymous";
    texture.onload = () => {
      if (active) setNightTextureReady(true);
    };
    texture.onerror = () => {
      if (active) setNightTextureReady(false);
    };
    texture.src = NIGHT_TEXTURE;
    return () => {
      active = false;
    };
  }, []);

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
    return () =>
      node.removeEventListener("webglcontextlost", handleContextLoss, true);
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

  // Force the first camera before painting the WebGL stage. The library opens
  // at altitude 2.5 by default; animating from there caused the distant view
  // to appear on every reload. Reapply after imagery/globe initialization too.
  const positionCamera = useCallback(
    (forceImmediate = false) => {
      const globe = globeRef.current;
      if (!globe || !selected || mapError) return;
      const first = !cameraInitializedRef.current;
      const changedCase = lastCameraCaseRef.current !== selected.id;
      const changedZoom = lastCameraAltitudeRef.current !== cameraAltitude;
      if (!forceImmediate && !first && !changedCase && !changedZoom) return;
      try {
        const duration = first || forceImmediate ? 0 : changedCase ? 550 : 200;
        globe.pointOfView(
          {
            lat: selected.company.hqLat,
            lng: selected.company.hqLon,
            altitude: cameraAltitude,
          },
          duration
        );
        globe.controls().autoRotate = false;
        cameraInitializedRef.current = true;
        lastCameraCaseRef.current = selected.id;
        lastCameraAltitudeRef.current = cameraAltitude;
        setCameraInitialized(true);
      } catch (error) {
        // Some devices expose the ref before the renderer initializes.
        // onGlobeReady retries with an immediate camera position.
        console.warn(
          "Globe camera not ready; will retry on initialization.",
          error
        );
      }
    },
    [selected, mapError, cameraAltitude]
  );

  useLayoutEffect(() => {
    positionCamera();
  }, [positionCamera]);

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
            {
              lat: selectedPoint.lat,
              lng: selectedPoint.lng,
              maxRadius: playbackEvent ? 4.2 : 2.7,
              speed: 1.15,
            },
            {
              lat: selectedPoint.lat,
              lng: selectedPoint.lng,
              maxRadius: playbackEvent ? 3.0 : 2.0,
              speed: 0.75,
            },
          ]
        : [],
    [selectedPoint, playbackEvent]
  );
  const fin = selected?.company.financials;
  const globeLesson = selected ? resolveGlobeSecurityLesson(selected) : null;
  const satelliteActive = satelliteReady && satelliteRequested;
  const textureUrl = satelliteActive
    ? SATELLITE_TEXTURE
    : nightTextureReady
      ? NIGHT_TEXTURE
      : "./earth-dark.svg";
  const changeZoom = (delta: number) => {
    setCameraAltitude((current) =>
      Math.max(
        MIN_FOCUS_ALTITUDE,
        Math.min(MAX_FOCUS_ALTITUDE, Number((current + delta).toFixed(2)))
      )
    );
  };
  const countryCode = selected?.company.countryCode;
  const headquarters = selected?.company.headquartersLabel ?? "";
  const chooseIncident = useCallback(
    (id: string) => {
      setSelectedIncidentId(id);
      setShowPopup(true);
    },
    [setSelectedIncidentId]
  );

  // HTML-marked hotspots are deliberate: a 32px DOM hit target remains clickable
  // when the more detailed 3D country polygons and pulse geometry overlap.
  // react-globe.gl handles projected placement and hides markers on the far side.
  const createCasePin = useCallback(
    (item: object): HTMLElement => {
      const incident = item as GlobePoint;
      const active = incident.id === selectedId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = active
        ? "globe-case-pin globe-case-pin--active"
        : "globe-case-pin";
      button.title = `${incident.label} — ${incident.title}`;
      button.setAttribute(
        "aria-label",
        `Select ${incident.label}: ${incident.title}`
      );
      button.setAttribute("aria-pressed", String(active));
      button.dataset.incidentId = incident.id;
      button.style.setProperty("--pulse-delay", `${incident.pulseDelay}s`);
      const dot = document.createElement("span");
      dot.className = "globe-case-pin__dot";
      dot.setAttribute("aria-hidden", "true");
      button.appendChild(dot);
      button.addEventListener("pointerdown", (event) =>
        event.stopPropagation()
      );
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        chooseIncident(incident.id);
      });
      button.addEventListener("mouseenter", () =>
        setHoveredIncidentId(incident.id)
      );
      button.addEventListener("mouseleave", () => setHoveredIncidentId(null));
      button.addEventListener("focus", () => setHoveredIncidentId(incident.id));
      button.addEventListener("blur", () => setHoveredIncidentId(null));
      return button;
    },
    [chooseIncident, selectedId]
  );

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
            <div
              className={
                cameraInitialized
                  ? "globe-scene globe-scene--focused"
                  : "globe-scene"
              }
            >
              <Globe
                ref={globeRef as never}
                width={dims.w}
                height={dims.h}
                animateIn={false}
                waitForGlobeReady={false}
                backgroundColor="#050709"
                globeImageUrl={textureUrl}
                polygonsData={countries}
                polygonGeoJsonGeometry={(item: object) =>
                  (item as CountryFeature).geometry as never
                }
                polygonAltitude={(item: object) =>
                  isSelectedCountry(
                    item as CountryFeature,
                    countryCode,
                    headquarters
                  )
                    ? 0.022
                    : 0.012
                }
                polygonCapColor={(item: object) =>
                  isSelectedCountry(
                    item as CountryFeature,
                    countryCode,
                    headquarters
                  )
                    ? "rgba(224,107,107,0.48)"
                    : satelliteActive
                      ? "rgba(20,25,30,0.025)"
                      : nightTextureReady
                        ? "rgba(45,56,66,0.35)"
                        : "rgba(75,84,93,0.96)"
                }
                polygonSideColor={() => "rgba(28,35,42,0.95)"}
                polygonStrokeColor={() =>
                  satelliteActive
                    ? "rgba(120,140,150,0.25)"
                    : nightTextureReady && !satelliteActive
                      ? "rgba(157,174,187,0.48)"
                      : "rgba(135,149,160,0.7)"
                }
                showAtmosphere
                atmosphereColor="#607280"
                atmosphereAltitude={0.1}
                onPolygonClick={(item: object) => {
                  if (
                    isSelectedCountry(
                      item as CountryFeature,
                      countryCode,
                      headquarters
                    )
                  )
                    setShowPopup((open) => !open);
                }}
                // No raised 3D cylinders: all case locations use surface
                // pulses with their own accessible HTML click targets.
                htmlElementsData={points}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={(item: object) =>
                  (item as GlobePoint).id === selectedId ? 0.026 : 0.015
                }
                htmlElement={createCasePin}
                htmlTransitionDuration={0}
                ringsData={rings}
                ringLat="lat"
                ringLng="lng"
                ringMaxRadius="maxRadius"
                ringPropagationSpeed="speed"
                ringRepeatPeriod={1750}
                ringColor={() => [
                  "rgba(224,107,107,0.85)",
                  "rgba(224,107,107,0.05)",
                ]}
                ringAltitude={0.027}
                ringResolution={72}
                onGlobeReady={() => positionCamera(true)}
              />
            </div>
          </GlobeErrorBoundary>
        )}

        <div className="absolute left-3 bottom-3 z-10 flex items-center gap-1">
          {!mapError && (
            <>
              <button
                type="button"
                onClick={() => changeZoom(-0.16)}
                disabled={cameraAltitude <= MIN_FOCUS_ALTITUDE}
                className="border border-white/20 bg-black/85 px-2.5 py-1.5 font-mono text-xs text-slate-200 hover:border-slate-300 disabled:opacity-40"
                aria-label="Zoom globe in toward the selected incident"
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => changeZoom(0.16)}
                disabled={cameraAltitude >= MAX_FOCUS_ALTITUDE}
                className="border border-white/20 bg-black/85 px-2.5 py-1.5 font-mono text-xs text-slate-200 hover:border-slate-300 disabled:opacity-40"
                aria-label="Zoom globe out from the selected incident"
                title="Zoom out"
              >
                −
              </button>
            </>
          )}
        </div>

        <div className="globe-map-mode-controls absolute right-3 top-3 z-10 flex flex-wrap justify-end items-center gap-2">
          <span className="rounded border border-white/15 bg-black/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-300">
            {hotspots.length} cases ·{" "}
            {mapError
              ? "2D backup"
              : satelliteActive
                ? "satellite texture"
                : "charcoal globe"}
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
              aria-label={
                satelliteRequested
                  ? "Use charcoal map texture"
                  : "Use optional satellite image texture"
              }
            >
              {satelliteRequested
                ? satelliteReady
                  ? "Charcoal view"
                  : "Loading satellite…"
                : "Satellite view"}
            </button>
          )}
        </div>
        {satelliteUnavailable && !mapError && (
          <p className="absolute right-3 top-12 z-10 bg-black/90 p-2 text-[10px] text-amber-200">
            Satellite image unavailable; charcoal globe retained.
          </p>
        )}
        {mapPlacard && (
          <aside
            className={
              mapPlacard.isPreview
                ? "map-case-placard map-case-placard--preview"
                : "map-case-placard"
            }
            aria-label={
              mapPlacard.isPreview ? "Hovered map case" : "Active map case"
            }
          >
            <div className="map-case-placard__masthead">
              <span className="map-case-placard__brand">
                <span className="map-case-placard__symbol" aria-hidden="true">
                  ◈
                </span>
                INQUISITION / FIELD NOTE
              </span>
              <span className="map-case-placard__counter">
                {String(placardCaseNumber).padStart(2, "0")}
                <span className="map-case-placard__counter-divider"> / </span>
                {String(incidents.length).padStart(2, "0")}
              </span>
            </div>
            <div className="map-case-placard__body">
              <div className="map-case-placard__state">
                <span
                  className="map-case-placard__state-indicator"
                  aria-hidden="true"
                />
                {mapPlacard.isPreview ? "HOVER PREVIEW" : "ACTIVE CASE"}
              </div>
              <h3 className="map-case-placard__company">
                {mapPlacard.incident.company.name}
              </h3>
              <p className="map-case-placard__title">
                {mapPlacard.incident.incidentTitle}
              </p>
              <div className="map-case-placard__metadata">
                <div>
                  <span className="map-case-placard__metadata-label">
                    CASE TYPE
                  </span>
                  <span className="map-case-placard__metadata-value">
                    {mapPlacard.incident.incidentTypeLabel}
                  </span>
                </div>
                <div>
                  <span className="map-case-placard__metadata-label">
                    FIRST REPORTED
                  </span>
                  <span className="map-case-placard__metadata-value">
                    {mapPlacard.incident.firstReportedLabel}
                  </span>
                </div>
              </div>
              <div className="map-case-placard__foot">
                <span>
                  HQ · {mapPlacard.incident.company.headquartersLabel}
                </span>
                <span className="map-case-placard__action">
                  {mapPlacard.isPreview
                    ? "SELECT PULSE TO OPEN"
                    : "CASE IN FOCUS"}
                </span>
              </div>
            </div>
          </aside>
        )}
        {playbackEvent && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 w-[min(28rem,calc(100%-2rem))] border border-rose-400/45 bg-black/90 px-4 py-3">
            <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-rose-300/85">
              <span>
                Case replay · {playbackEvent.index + 1}/{playbackEvent.total}
              </span>
              <span>{playbackPlaying ? "Playing" : "Paused"}</span>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              {playbackEvent.event.dateLabel}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-white">
              {playbackEvent.event.label}
            </div>
            {playbackEvent.event.detail && (
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                {playbackEvent.event.detail}
              </p>
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

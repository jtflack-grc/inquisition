/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopologyJson from "world-atlas/countries-110m.json";
import { resolveGlobeSecurityLesson } from "../inquisition/globeSecurityLesson";
import {
  selectSelectedIncident,
  useIncidentStore,
} from "../store/incidentStore";

declare global {
  interface Window {
    Cesium: any;
    CESIUM_BASE_URL?: string;
  }
}

const CESIUM_BASE_URL =
  "https://cesium.com/downloads/cesiumjs/releases/1.145/Build/Cesium/";
const ARCGIS_TERRAIN_URL =
  "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer";
const ARCGIS_IMAGERY_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";

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

function isHighlightCountryName(
  name: string,
  code: string | undefined,
  canonicalHint: string
): boolean {
  if (!code) return false;
  const aliases = COUNTRY_ALIASES[code] ?? [canonicalHint].filter(Boolean);
  return aliases.some(
    (alias) => alias === name || name.includes(alias) || alias.includes(name)
  );
}

function getEntityCountryName(entity: any): string {
  const property = entity?.properties?.name;
  const value = property?.getValue ? property.getValue() : property;
  return String(value ?? entity?.name ?? "");
}

export function ScenarioGlobe() {
  const incidents = useIncidentStore((s) => s.incidents);
  const selectedId = useIncidentStore((s) => s.selectedIncidentId);
  const setSelectedIncidentId = useIncidentStore(
    (s) => s.setSelectedIncidentId
  );
  const selected = useIncidentStore(selectSelectedIncident);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const countrySourceRef = useRef<any>(null);
  const clickHandlerRef = useRef<any>(null);
  const [showPopup, setShowPopup] = useState(true);
  const [ready, setReady] = useState(false);
  const [hoveredIncidentId, setHoveredIncidentId] = useState<string | null>(
    null
  );
  const [terrainState, setTerrainState] = useState<
    "loading" | "streaming" | "fallback" | "error"
  >("loading");

  const hotspots = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          Number.isFinite(incident.company.hqLat) &&
          Number.isFinite(incident.company.hqLon)
      ),
    [incidents]
  );

  const hoveredIncident = useMemo(
    () =>
      incidents.find((incident) => incident.id === hoveredIncidentId) ?? null,
    [hoveredIncidentId, incidents]
  );

  useEffect(() => {
    let disposed = false;
    let viewer: any = null;

    const initialize = async () => {
      window.CESIUM_BASE_URL = CESIUM_BASE_URL;
      const Cesium = window.Cesium;
      if (!Cesium || !containerRef.current) {
        setTerrainState("error");
        return;
      }

      let terrainProvider: any;
      try {
        terrainProvider =
          await Cesium.ArcGISTiledElevationTerrainProvider.fromUrl(
            ARCGIS_TERRAIN_URL
          );
        if (!disposed) setTerrainState("streaming");
      } catch (error) {
        console.warn(
          "Cesium terrain unavailable; using ellipsoid fallback.",
          error
        );
        terrainProvider = new Cesium.EllipsoidTerrainProvider();
        if (!disposed) setTerrainState("fallback");
      }

      if (disposed || !containerRef.current) return;

      viewer = new Cesium.Viewer(containerRef.current, {
        animation: false,
        baseLayer: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        terrainProvider,
      });
      viewerRef.current = viewer;

      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#07111b");
      viewer.scene.highDynamicRange = true;
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30_000_000;
      viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5);

      try {
        const imageryProvider =
          await Cesium.ArcGisMapServerImageryProvider.fromUrl(
            ARCGIS_IMAGERY_URL
          );
        if (!disposed && viewer && !viewer.isDestroyed()) {
          const layer =
            viewer.imageryLayers.addImageryProvider(imageryProvider);
          layer.brightness = 0.8;
          layer.contrast = 1.07;
          layer.saturation = 0.78;
        }
      } catch (error) {
        console.warn("ArcGIS World Imagery could not be loaded.", error);
      }

      try {
        const countries = await Cesium.GeoJsonDataSource.load(
          { type: "FeatureCollection", features: COUNTRY_FEATURES },
          { clampToGround: true }
        );
        if (!disposed && viewer && !viewer.isDestroyed()) {
          viewer.dataSources.add(countries);
          countrySourceRef.current = countries;
        }
      } catch (error) {
        console.warn("Country overlay could not be loaded.", error);
      }

      if (disposed || !viewer || viewer.isDestroyed()) return;

      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.position);
        const entity = picked?.id;
        const incidentId = entity?.__inquisitionIncidentId;
        if (incidentId) {
          setSelectedIncidentId(String(incidentId));
          setShowPopup(true);
          return;
        }
        if (entity?.__inquisitionSelectedCountry) {
          setShowPopup((previous) => !previous);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.endPosition);
        const incidentId = picked?.id?.__inquisitionIncidentId;
        const nextId = incidentId ? String(incidentId) : null;
        setHoveredIncidentId((current) =>
          current === nextId ? current : nextId
        );
        viewer.scene.canvas.style.cursor = nextId ? "pointer" : "default";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      clickHandlerRef.current = handler;
      setReady(true);
    };

    void initialize();

    return () => {
      disposed = true;
      if (clickHandlerRef.current && !clickHandlerRef.current.isDestroyed()) {
        clickHandlerRef.current.destroy();
      }
      clickHandlerRef.current = null;
      countrySourceRef.current = null;
      viewerRef.current = null;
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
  }, [setSelectedIncidentId]);

  useEffect(() => {
    if (!ready || !selected) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    if (!Cesium || !viewer || viewer.isDestroyed()) return;

    viewer.entities.removeAll();

    for (const incident of hotspots) {
      const isSelected = incident.id === selectedId;
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          incident.company.hqLon,
          incident.company.hqLat,
          isSelected ? 1800 : 900
        ),
        point: {
          pixelSize: isSelected
            ? new Cesium.CallbackProperty(() => {
                const pulse = (Math.sin(Date.now() / 260) + 1) / 2;
                return 11 + pulse * 6;
              }, false)
            : 7,
          color: Cesium.Color.fromCssColorString(
            isSelected ? "#e06b6b" : "#7ea4bf"
          ),
          outlineColor: Cesium.Color.fromCssColorString(
            isSelected ? "#ffe0e0" : "#11161b"
          ),
          outlineWidth: isSelected ? 2.5 : 1,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          disableDepthTestDistance: isSelected
            ? Number.POSITIVE_INFINITY
            : undefined,
        },
        label: isSelected
          ? {
              text: incident.company.name,
              font: "600 13px IBM Plex Sans, sans-serif",
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 4,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            }
          : undefined,
      });
      entity.__inquisitionIncidentId = incident.id;
    }

    const selectedRed = Cesium.Color.fromCssColorString("#e06b6b");
    for (const phaseOffset of [0, 0.5]) {
      const radius = new Cesium.CallbackProperty(() => {
        const phase = (((Date.now() / 1800 + phaseOffset) % 1) + 1) % 1;
        return 55_000 + phase * 145_000;
      }, false);
      const ringColor = new Cesium.CallbackProperty(() => {
        const phase = (((Date.now() / 1800 + phaseOffset) % 1) + 1) % 1;
        return selectedRed.withAlpha(Math.max(0.06, 0.9 - phase * 0.84));
      }, false);
      const fillColor = new Cesium.CallbackProperty(() => {
        const phase = (((Date.now() / 1800 + phaseOffset) % 1) + 1) % 1;
        return selectedRed.withAlpha(Math.max(0.015, 0.13 - phase * 0.11));
      }, false);

      const selectedPulse = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          selected.company.hqLon,
          selected.company.hqLat
        ),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: new Cesium.ColorMaterialProperty(fillColor),
          outline: true,
          outlineColor: ringColor,
          height: 0,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      selectedPulse.__inquisitionIncidentId = selected.id;
    }

    const countrySource = countrySourceRef.current;
    if (countrySource) {
      for (const entity of countrySource.entities.values) {
        const countryName = getEntityCountryName(entity);
        const isSelectedCountry = isHighlightCountryName(
          countryName,
          selected.company.countryCode,
          selected.company.headquartersLabel
        );
        entity.__inquisitionSelectedCountry = isSelectedCountry;
        if (entity.polygon) {
          entity.polygon.material = isSelectedCountry
            ? Cesium.Color.fromCssColorString("#e06b6b").withAlpha(0.18)
            : Cesium.Color.TRANSPARENT;
          entity.polygon.outline = isSelectedCountry;
          entity.polygon.outlineColor = isSelectedCountry
            ? Cesium.Color.fromCssColorString("#e89a9a")
            : Cesium.Color.TRANSPARENT;
        }
      }
    }

    setShowPopup(true);
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        selected.company.hqLon,
        selected.company.hqLat,
        10_500_000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0,
      },
      duration: 1.4,
    });
  }, [hotspots, ready, selected, selectedId]);

  useEffect(() => {
    if (!showPopup) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPopup(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showPopup]);

  const fin = selected?.company.financials;
  const globeLesson = selected ? resolveGlobeSecurityLesson(selected) : null;

  return (
    <div className="globe-field relative w-full h-full min-h-[320px] bg-black overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute right-3 top-3 z-10 rounded border border-white/15 bg-black/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-300">
        {hotspots.length} cases ·{" "}
        {terrainState === "streaming" ? "terrain streamed" : terrainState}
      </div>

      {hoveredIncident && hoveredIncident.id !== selectedId && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 max-w-[260px] rounded border border-white/15 bg-black/80 px-3 py-2">
          <div className="text-xs font-medium text-white">
            {hoveredIncident.company.name}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            {hoveredIncident.incidentTitle}
          </div>
        </div>
      )}

      {showPopup && selected && globeLesson && (
        <div
          className="pointer-events-auto absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-[min(22rem,calc(100%-1rem))] max-h-[min(85vh,560px)] overflow-y-auto rounded-2xl bg-black/95 border border-war-border px-4 py-4 sm:px-5 sm:py-5 z-20"
          role="dialog"
          aria-label="Incident and HQ details"
        >
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-war-border/50">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.12em] uppercase text-emerald-400 mb-1 font-semibold truncate">
                {selected.company.headquartersLabel}
              </div>
              <div className="text-xl font-semibold text-war-white mb-1">
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
              <h3 className="text-xs font-semibold text-war-muted">Summary</h3>
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
              <h3 className="text-xs font-semibold text-war-muted mb-3">
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
                  <div className="text-lg font-semibold font-mono text-war-white">
                    {fin?.revenueUSDm != null
                      ? `$${fin.revenueUSDm.toLocaleString()}M`
                      : "—"}
                  </div>
                </div>
                <div className="rounded-lg bg-black/40 p-2 border border-war-border/30">
                  <div className="text-war-muted text-[10px] mb-1">EBITDA</div>
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

            <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-3 py-3 space-y-2">
              <h3 className="text-[10px] font-semibold text-violet-300/95">
                Attack type & mechanics
              </h3>
              <p className="text-[11px] text-war-white/90 leading-relaxed">
                {globeLesson.attackMechanism}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/15 px-3 py-3 space-y-1.5">
              <h3 className="text-[10px] font-semibold text-amber-200/95">
                Case-specific analysis
              </h3>
              <p className="text-[10px] text-amber-50/90 leading-relaxed">
                {globeLesson.caseAnalysis}
              </p>
            </div>

            {(globeLesson.identification.length > 0 ||
              globeLesson.prevention.length > 0) && (
              <div className="rounded-xl border border-violet-500/35 bg-violet-950/20 px-3 py-3 space-y-2">
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

            <div className="rounded-xl border border-sky-500/45 bg-sky-950/20 px-3 py-3 space-y-2">
              <h3 className="text-[10px] font-semibold text-sky-200/95">
                Response & mitigation priorities
              </h3>
              <p className="text-[9px] text-war-muted/90 leading-relaxed">
                Tailored to this incident profile—execute with your IR retainer,
                legal, and business continuity leads.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[10px] text-sky-50/90 leading-relaxed">
                {globeLesson.mitigationPriority.map((line, index) => (
                  <li key={index} className="pl-0.5 marker:text-sky-400/90">
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

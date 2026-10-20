import { useMemo } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopologyJson from "world-atlas/countries-110m.json";
import type { Incident } from "../inquisition/types";

/**
 * Last-resort, network-independent case navigator for blocked Cesium/CDN/WebGL.
 * It uses the already-bundled world-atlas data and never changes model inputs.
 */
const WIDTH = 960;
const HEIGHT = 480;

const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;

function point(coordinates: number[]): [number, number] {
  const lon = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  return [
    ((Math.max(-180, Math.min(180, lon)) + 180) / 360) * WIDTH,
    ((90 - Math.max(-90, Math.min(90, lat))) / 180) * HEIGHT,
  ];
}

function ringPath(ring: number[][]): string {
  return (
    ring
      .map((coordinates, index) => {
        const [x, y] = point(coordinates);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

function geometryPath(geometry: {
  type: string;
  coordinates?: unknown;
}): string {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as number[][][]).map(ringPath).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .flatMap((polygon) => polygon.map(ringPath))
      .join(" ");
  }
  return "";
}

const landPaths = feature(topology, topology.objects.countries)
  .features.map((country) => geometryPath(country.geometry))
  .filter(Boolean);

export function ScenarioGlobeFallback({
  hotspots,
  selectedId,
  onSelect,
}: {
  hotspots: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = useMemo(
    () => hotspots.find((incident) => incident.id === selectedId),
    [hotspots, selectedId]
  );

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#07111b] px-2"
      role="region"
      aria-label="Interactive fallback incident map"
    >
      <div className="absolute left-3 top-3 z-10 max-w-[70%] font-mono text-[10px] uppercase tracking-widest text-slate-300">
        Case geography / 2D backup
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full max-h-[78%]"
        aria-label="World map. Select a case marker to inspect an incident."
      >
        <rect width={WIDTH} height={HEIGHT} fill="#07111b" />
        {landPaths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="#1d353e"
            fillRule="evenodd"
            stroke="#3a5961"
            strokeWidth={0.65}
          />
        ))}
        {hotspots.map((incident) => {
          const [x, y] = point([
            incident.company.hqLon,
            incident.company.hqLat,
          ]);
          const active = incident.id === selectedId;
          return (
            <g
              key={incident.id}
              role="button"
              tabIndex={0}
              aria-label={`Select ${incident.company.name}: ${incident.incidentTitle}`}
              onClick={() => onSelect(incident.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(incident.id);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <title>
                {incident.company.name} — {incident.incidentTitle}
              </title>
              {active && (
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill="none"
                  stroke="#e06b6b"
                  strokeWidth={2}
                  opacity={0.8}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={active ? 6 : 4}
                fill={active ? "#e06b6b" : "#7ea4bf"}
                stroke={active ? "#ffe0e0" : "#07111b"}
                strokeWidth={1.8}
              />
            </g>
          );
        })}
        {selected &&
          (() => {
            const [x, y] = point([
              selected.company.hqLon,
              selected.company.hqLat,
            ]);
            return (
              <text
                x={x}
                y={y > HEIGHT / 2 ? y - 17 : y + 23}
                fill="#ffffff"
                stroke="#07111b"
                strokeWidth={3}
                paintOrder="stroke"
                fontSize={13}
                fontFamily="IBM Plex Sans, sans-serif"
                textAnchor="middle"
                pointerEvents="none"
              >
                {selected.company.name}
              </text>
            );
          })()}
      </svg>
      <p className="absolute bottom-3 left-3 right-3 text-[10px] leading-relaxed text-slate-300">
        3D rendering unavailable in this browser. Case markers, evidence, and
        FAIR-informed analysis remain interactive.
      </p>
    </div>
  );
}

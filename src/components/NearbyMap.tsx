"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchOsmPointsAround, type OsmGeoPoint } from "@/lib/externalProviders/osmGeo";

// Default center: Santiago, Chile (used when geolocation is unavailable/denied).
const DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693];
const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

type Status = "loading" | "ready" | "error";

/** Loads Leaflet from CDN once and resolves with the global L. */
function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no_window"));
    const w = window as any;
    if (w.L) return resolve(w.L);
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(w.L));
      existing.addEventListener("error", () => reject(new Error("leaflet_failed")));
      if (w.L) resolve(w.L);
      return;
    }
    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(w.L);
    script.onerror = () => reject(new Error("leaflet_failed"));
    document.head.appendChild(script);
  });
}

export function NearbyMap({ className, minHeightClass = "min-h-[420px]" }: { className?: string; minHeightClass?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let L: any;

    async function getCenter(): Promise<{ coords: [number, number]; approximate: boolean }> {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          return resolve({ coords: DEFAULT_CENTER, approximate: true });
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ coords: [pos.coords.latitude, pos.coords.longitude], approximate: false }),
          () => {
            resolve({ coords: DEFAULT_CENTER, approximate: true });
          },
          { timeout: 7000, maximumAge: 600000 },
        );
      });
    }

    async function init() {
      try {
        L = await loadLeaflet();
        if (cancelled || !containerRef.current) return;
        const { coords: center, approximate } = await getCenter();
        if (cancelled || !containerRef.current) return;

        const map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true }).setView(center, 14);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        const youIcon = L.divIcon({
          html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:#0f766e;border:3px solid #fff;box-shadow:0 0 0 2px #0f766e"></span>',
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker(center, { icon: youIcon }).addTo(map).bindPopup(approximate ? "Ubicacion aproximada" : "Estas aqui");

        setStatus("ready");

        const points: OsmGeoPoint[] = await fetchOsmPointsAround({ lat: center[0], lng: center[1], radius: 4000, limit: 24 });
        if (cancelled) return;
        const bizIcon = L.divIcon({
          html: '<span style="display:block;width:12px;height:12px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 0 0 1px #b45309"></span>',
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        for (const p of points) {
          L.marker([p.lat, p.lng], { icon: bizIcon })
            .addTo(map)
            .bindPopup(
              `<strong>${p.name}</strong>${p.category ? `<br/>${p.category}` : ""}<br/>` +
                `<span style="font-size:11px;color:#64748b">No verificado por OficiosPro</span><br/>` +
                `<a href="${p.mapsUrl}" target="_blank" rel="noopener noreferrer nofollow">Ver en el mapa</a>`,
            );
        }
        setCount(points.length);
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "error") {
    return (
      <div className={`grid place-content-center gap-2 rounded-[28px] border border-line bg-slate-50 p-6 text-center ${className ?? ""}`}>
        <p className="text-sm font-black text-ink">No pudimos cargar el mapa ahora.</p>
        <Link href="/especialistas" className="btn-primary mx-auto px-4 py-2 text-sm">Ver especialistas cerca</Link>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[28px] border border-line shadow-card ${className ?? ""}`}>
      <div ref={containerRef} className={`h-full w-full ${minHeightClass}`} aria-label="Mapa de negocios y especialistas cercanos" />
      <div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black text-ink shadow-sm">
        {status === "loading" ? "Cargando mapa..." : `Cerca de ti${count ? ` · ${count} negocios` : ""}`}
      </div>
      <div className="absolute inset-x-3 bottom-3 z-[400] flex flex-wrap items-center justify-between gap-2">
        <span className="pointer-events-none rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-muted shadow-sm">
          Negocios de OpenStreetMap. No verificados por OficiosPro.
        </span>
        <Link href="/especialistas" className="btn-primary px-3 py-1.5 text-xs shadow-sm">
          Ver especialistas OficiosPro
        </Link>
      </div>
    </div>
  );
}

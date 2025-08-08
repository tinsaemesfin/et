"use client";
import dynamic from "next/dynamic";
import * as React from "react";

// Dynamically import heavy components on client only with proper loading state
const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md flex items-center justify-center text-sm opacity-60">Loading map...</div>
});
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false });
import { useMap, useMapEvents } from "react-leaflet";
import type { LeafletMouseEvent, Map as LeafletMap } from "leaflet";

export function MapPicker({
  lat,
  lng,
  onPick,
  markers,
}: {
  lat: number | null;
  lng: number | null;
  onPick?: (lat: number, lng: number) => void;
  markers?: Array<{ lat: number; lng: number; type?: "power" | "water"; key?: string }>;
}) {
  const mapRef = React.useRef<LeafletMap | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [sizeKey, setSizeKey] = React.useState<string>("init");
  const center = React.useMemo<[number, number]>(() => {
    if (lat != null && lng != null) return [lat, lng];
    // Default to Addis Ababa
    return [8.9806, 38.7578];
  }, [lat, lng]);

  // Force a lightweight re-mount of the map if the wrapper size changes
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let width = 0;
    let height = 0;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      const w = Math.round(cr.width);
      const h = Math.round(cr.height);
      // Avoid thrashing: only update when it actually changed
      if (w !== width || h !== height) {
        width = w;
        height = h;
        setSizeKey(`${w}x${h}`);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function ClickHandler() {
    useMapEvents({
      click: (e: LeafletMouseEvent) => {
        if (onPick) onPick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  type AnyProps = Record<string, unknown>;
  const AnyMap = MapContainer as unknown as React.ComponentType<AnyProps>;
  const AnyTile = TileLayer as unknown as React.ComponentType<AnyProps>;
  const AnyCircle = CircleMarker as unknown as React.ComponentType<AnyProps>;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* Keep a ref to the Leaflet map instance so overlays outside the MapContainer can interact with it */}
      <AnyMap
        key={sizeKey}
        center={center}
        zoom={12}
        className="h-full w-full"
        style={{ cursor: "crosshair" }}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        zoomControl={true}
        attributionControl={false}
        preferCanvas={false}
        whenCreated={(m: LeafletMap) => {
          mapRef.current = m;
          // Ensure dragging is enabled
          if (m.dragging) {
            m.dragging.enable();
          }
        }}
        whenReady={(e: { target: LeafletMap }) => {
          // Ensure the internal tiles and panes are laid out correctly
          const m = e.target;
          // Multiple invalidations to handle complex layouts
          requestAnimationFrame(() => {
            m.invalidateSize();
            setTimeout(() => m.invalidateSize(), 50);
            setTimeout(() => m.invalidateSize(), 150);
            setTimeout(() => m.invalidateSize(), 300);
          });
        }}
      >
        <AnyTile url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Ensure Leaflet recalculates size after mounting in flex/hidden containers */}
        <AutoResize />
        <ClickHandler />
        {lat != null && lng != null && (
          <AnyCircle center={[lat, lng]} radius={8} pathOptions={{ color: "#1273eb", fillColor: "#1273eb", fillOpacity: 0.9 }} />
        )}
        {markers?.filter((m) => m.lat != null && m.lng != null).map((m, idx) => (
          <AnyCircle key={m.key ?? idx} center={[m.lat, m.lng]} radius={7} pathOptions={{ color: m.type === "power" ? "#f59e0b" : "#3b82f6", fillColor: m.type === "power" ? "#f59e0b" : "#3b82f6", fillOpacity: 0.85 }} />
        ))}
      </AnyMap>
      {/* Center crosshair indicator (non-interactive), helps mobile users */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[400]">
        <div className="relative pointer-events-none">
          <div className="w-4 h-4 rounded-full border-2 border-[--color-brand] opacity-75 bg-white/20 backdrop-blur-sm" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-2 border-l-2 border-[--color-brand] opacity-75" />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-2 border-l-2 border-[--color-brand] opacity-75" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 border-t-2 border-[--color-brand] opacity-75" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 border-t-2 border-[--color-brand] opacity-75" />
        </div>
      </div>
      {/* Mobile-friendly controls */}
      <Controls onPick={onPick} mapRef={mapRef} />
    </div>
  );
}

function AutoResize() {
  const map = useMap();
  React.useEffect(() => {
    const invalidate = () => {
      if (map && map.getContainer()) {
        map.invalidateSize(true); // Force re-calculation
        // Additional fixes for rendering issues
        const container = map.getContainer();
        if (container) {
          const style = container.style;
          style.visibility = 'visible';
          style.opacity = '1';
        }
      }
    };
    
    // Aggressive initial invalidations to fix rendering issues
    const timeouts = [
      setTimeout(invalidate, 0),
      setTimeout(invalidate, 50),
      setTimeout(invalidate, 150),
      setTimeout(invalidate, 300),
      setTimeout(invalidate, 600),
    ];

    // Observe container size changes with debouncing
    const container = map.getContainer();
    let raf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        invalidate();
        // Force tile refresh if needed
        map.eachLayer((layer: unknown) => {
          if (layer && typeof layer === 'object' && '_url' in layer) {
            const tileLayer = layer as unknown as { redraw?: () => void };
            if (typeof tileLayer.redraw === 'function') {
              tileLayer.redraw();
            }
          }
        });
      });
    });
    
    if (container) {
      ro.observe(container);
    }

    // Handle window events
    const handleResize = () => {
      invalidate();
      setTimeout(invalidate, 100); // Double invalidation for complex layouts
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    
    // Handle visibility changes (tab switching, etc.)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(invalidate, 100);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [map]);
  return null;
}

function Controls({ onPick, mapRef }: { onPick?: (lat: number, lng: number) => void; mapRef: React.RefObject<LeafletMap | null> }) {
  const pickHere = () => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    onPick?.(c.lat, c.lng);
  };
  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (map) {
          map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
        }
        onPick?.(latitude, longitude);
      },
      () => {
        // If permission denied or error, just try to center without picking
        // No-op fallback
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  return (
    <div className="absolute right-2 bottom-2 flex flex-col gap-2 z-[401]">
      <button
        type="button"
        onClick={locateMe}
        aria-label="Use my location"
        className="px-2.5 py-1.5 text-[12px] sm:text-xs rounded-md bg-white/90 dark:bg-black/60 border border-black/10 dark:border-white/15 shadow-sm backdrop-blur hover:bg-white"
      >
        Use my location
      </button>
      <button
        type="button"
        onClick={pickHere}
        aria-label="Pick this location"
        className="px-2.5 py-1.5 text-[12px] sm:text-xs rounded-md bg-[--color-brand] text-white shadow"
      >
        Pick here
      </button>
    </div>
  );
}



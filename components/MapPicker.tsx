"use client";
import dynamic from "next/dynamic";
import * as React from "react";

// Dynamically import heavy components on client only
const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false });
import { useMapEvents } from "react-leaflet";

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
  const center = React.useMemo<[number, number]>(() => {
    if (lat != null && lng != null) return [lat, lng];
    // Default to Addis Ababa
    return [8.9806, 38.7578];
  }, [lat, lng]);

  function ClickHandler() {
    if (!onPick) return null as any;
    useMapEvents({
      click: (e) => onPick(e.latlng.lat, e.latlng.lng),
    });
    return null;
  }

  return (
    <MapContainer center={center as any} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} attributionControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler />
      {lat != null && lng != null && (
        <CircleMarker center={[lat, lng] as any} radius={8} pathOptions={{ color: "#1273eb", fillColor: "#1273eb", fillOpacity: 0.9 }} />
      )}
      {markers?.filter((m) => m.lat != null && m.lng != null).map((m, idx) => (
        <CircleMarker key={m.key ?? idx} center={[m.lat, m.lng] as any} radius={7} pathOptions={{ color: m.type === "power" ? "#f59e0b" : "#3b82f6", fillColor: m.type === "power" ? "#f59e0b" : "#3b82f6", fillOpacity: 0.85 }} />
      ))}
    </MapContainer>
  );
}



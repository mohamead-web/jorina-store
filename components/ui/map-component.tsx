"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

function MapEvents({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMoveEnd(center.lat, center.lng);
    },
  });
  return null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const currentCenter = map.getCenter();
    const newCenter = L.latLng(center[0], center[1]);
    const distance = currentCenter.distanceTo(newCenter);
    // Only set view if the distance is greater than 1 meter.
    // This prevents infinite loops caused by floating point drift from moveend events.
    if (distance > 1) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({
  center,
  zoom = 15,
  onLocationChange,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={true}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMoveEnd={onLocationChange} />
      <ChangeView center={[center.lat, center.lng]} zoom={zoom} />
    </MapContainer>
  );
}

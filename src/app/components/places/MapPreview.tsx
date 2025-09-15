// src/app/components/places/MapPreview.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet'; // works without esModuleInterop

export default function MapPreview({
  lat,
  lng,
  address,
}: {
  lat?: number;
  lng?: number;
  address?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  useEffect(() => {
    if (!containerRef.current) return;

    // init map once
    if (!mapRef.current) {
      const map = L.map(containerRef.current, { scrollWheelZoom: true, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Ensure marker icons work in Next bundling
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapRef.current = map;
    }

    const map = mapRef.current!;

    if (hasCoords) {
      const p = L.latLng(lat as number, lng as number);
      map.setView(p, 14);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker(p).addTo(map);
    } else {
      map.setView([51.1657, 10.4515], 6); // Germany default
    }

    // fix size after first paint
    setTimeout(() => map.invalidateSize(), 80);
  }, [lat, lng, hasCoords]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      try { mapRef.current?.remove(); } catch {}
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: 360, borderRadius: 12, border: '1px solid #e5e7eb' }}
      />
      {!hasCoords ? (
        <p className="help" style={{ marginTop: 8 }}>
          No coordinates yet. Click <strong>Check address</strong> to geocode and preview the map.
        </p>
      ) : null}
      {address ? <p className="help" style={{ marginTop: 6 }}>Address: {address}</p> : null}
    </div>
  );
}






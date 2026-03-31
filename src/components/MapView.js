import React, { useEffect, useRef } from "react";
import L from "leaflet";

function makeSvgIcon(fill) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -36],
  });
}

const colorMap = { red: "#dc2626", blue: "#2563eb", green: "#16a34a" };

function createIcon(color = "red") {
  return makeSvgIcon(colorMap[color] || colorMap.red);
}

export default function MapView({ latitude, longitude, markers = [], zoom = 15, className = "h-[300px] w-full rounded-lg relative z-0" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }

    const map = L.map(mapRef.current, { attributionControl: false }).setView([latitude, longitude], zoom);
    mapInstanceRef.current = map;

    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    if (markers.length === 0) {
      L.marker([latitude, longitude], { icon: createIcon("red") }).addTo(map).bindPopup("Current Location").openPopup();
    } else {
      markers.forEach((m) => {
        L.marker([m.lat, m.lng], { icon: createIcon(m.color || "red") }).addTo(map).bindPopup(m.label);
      });
      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [latitude, longitude, zoom, JSON.stringify(markers)]);

  return <div ref={mapRef} className={className} />;
}

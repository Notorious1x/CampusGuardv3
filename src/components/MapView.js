import React, { useEffect, useRef } from "react";
import L from "leaflet";

const iconColors = {
  red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
};

function createIcon(color = "red") {
  return L.icon({
    iconUrl: iconColors[color] || iconColors.red,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  });
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

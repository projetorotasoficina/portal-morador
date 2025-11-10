import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const mapRef = useRef<L.Map>(null);
  const [center, setCenter] = useState<[number, number]>([-26.2296, -52.6697]); // Pato Branco

  useEffect(() => {
    if (latitude && longitude) {
      setCenter([latitude, longitude]);
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {latitude && longitude && <Marker position={[latitude, longitude]} />}
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}

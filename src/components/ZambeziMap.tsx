import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L, { LatLngExpression, LatLngLiteral } from 'leaflet';
import { useMemo } from 'react';

interface ZambeziMapProps {
  route: LatLngLiteral[];
  position: LatLngLiteral;
}

interface ThreatMarker {
  position: LatLngLiteral;
  label: string;
}

const threatMarkers: ThreatMarker[] = [
  {
    position: { lat: -12.29, lng: 22.36 },
    label: 'Deforestation hotspot – woodland loss since 2010',
  },
  {
    position: { lat: -12.18, lng: 22.65 },
    label: 'Fire cluster – increased burn frequency',
  },
  {
    position: { lat: -12.05, lng: 22.91 },
    label: 'Logging area – road expansion risk',
  },
];

const baseCenter: LatLngExpression = [-12.2, 22.6];

const defaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const expeditionIcon = L.divIcon({
  className: 'expedition-marker',
  html: '<div class="pulse"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const threatIcon = L.divIcon({
  className: '',
  html: '<div class="threat-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const ZambeziMap = ({ route, position }: ZambeziMapProps) => {
  const bounds = useMemo(() => L.latLngBounds(route), [route]);

  return (
    <MapContainer
      center={baseCenter}
      zoom={8}
      scrollWheelZoom
      bounds={bounds}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline positions={route} color="#14b8a6" weight={4} opacity={0.9} />
      <CircleMarker center={route[0]} radius={6} color="#22c55e" fillOpacity={0.8} />
      <CircleMarker center={route[route.length - 1]} radius={6} color="#f97316" fillOpacity={0.8} />

      <Marker position={position} icon={expeditionIcon} />

      {threatMarkers.map((marker) => (
        <Marker key={`${marker.position.lat}-${marker.position.lng}`} position={marker.position} icon={threatIcon}>
          <Popup>
            <strong>{marker.label}</strong>
            <br />
            Simulated alert near the Zambezi source.
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ZambeziMap;

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';

// Fix for default marker icons not loading in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const subjectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const compIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CompMarker {
  id: string;
  latitude?: number;
  longitude?: number;
  street: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  priceSold: number;
  pricePerSqft: number;
}

interface CompsMapProps {
  subjectLatitude?: number;
  subjectLongitude?: number;
  subjectAddress?: string;
  comps: CompMarker[];
  type: 'sale' | 'rent';
}

// Component to auto-fit bounds
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (positions.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
      fitted.current = true;
    }
  }, [map, positions]);

  return null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CompsMap({
  subjectLatitude,
  subjectLongitude,
  subjectAddress,
  comps,
  type,
}: CompsMapProps) {
  // Filter comps with valid coordinates
  const validComps = comps.filter(
    (comp) => comp.latitude != null && comp.longitude != null
  );

  // Build positions array for bounds fitting
  const positions: [number, number][] = [];

  if (subjectLatitude != null && subjectLongitude != null) {
    positions.push([subjectLatitude, subjectLongitude]);
  }

  validComps.forEach((comp) => {
    positions.push([comp.latitude!, comp.longitude!]);
  });

  // Default center (US center) if no valid positions
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const center = positions.length > 0 ? positions[0] : defaultCenter;

  if (positions.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          No location data available for map
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={positions} />

        {/* Subject property marker */}
        {subjectLatitude != null && subjectLongitude != null && (
          <Marker position={[subjectLatitude, subjectLongitude]} icon={subjectIcon}>
            <Popup>
              <div className="text-sm">
                <strong className="text-brand-600">Subject Property</strong>
                {subjectAddress && <p className="mt-1">{subjectAddress}</p>}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Comp markers */}
        {validComps.map((comp) => (
          <Marker
            key={comp.id}
            position={[comp.latitude!, comp.longitude!]}
            icon={compIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">{comp.street}</p>
                <p className="text-gray-600">
                  {comp.city}, {comp.state}
                </p>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="text-gray-500">{type === 'sale' ? 'Sold' : 'Rent'}:</span>{' '}
                    <strong>{formatCurrency(comp.priceSold)}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">$/sqft:</span>{' '}
                    <strong>${comp.pricePerSqft.toFixed(2)}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Bed/Bath:</span>{' '}
                    <strong>{comp.beds}/{comp.baths}</strong>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

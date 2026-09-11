"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

type Pharmacy = {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number;
};

type NearbyPharmacyMapProps = {
  latitude: number;
  longitude: number;
  pharmacies: Pharmacy[];
};

const pharmacyIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function NearbyPharmacyMap({
  latitude,
  longitude,
  pharmacies,
}: NearbyPharmacyMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[450px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Patient location */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Your Location</p>

              <p className="mt-1 text-slate-500">You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Pharmacy locations */}
        {pharmacies.map((pharmacy) => {
          if (pharmacy.latitude === null || pharmacy.longitude === null) {
            return null;
          }

          return (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.latitude, pharmacy.longitude]}
              icon={pharmacyIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-slate-900">
                    {pharmacy.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {pharmacy.address}
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {pharmacy.distanceKm} km away
                  </p>

                  {pharmacy.phone && (
                    <a
                      href={`tel:${pharmacy.phone}`}
                      className="mt-2 block text-sm font-medium text-blue-600"
                    >
                      {pharmacy.phone}
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

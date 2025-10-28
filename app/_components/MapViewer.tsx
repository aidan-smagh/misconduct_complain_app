"use client";
import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Popup, useMap, useMapEvents } from "react-leaflet";
import { Map as LeafletMapType } from "leaflet";
import "leaflet/dist/leaflet.css";

import { geocodeAddress, reverseGeocode, findJurisdictionByCoordinate } from "@/services/GeoService";
import SearchSection from "./SearchSection";
import InfoModal from "./InfoModal";
import CoordinateInfoModal from "./CoordinateInfoModal";
import { NominatimSuggestion } from "@/lib/types/nominatim";
import { getInteriorPoint } from "@/lib/util/geojson";

interface SelectedLocation {
  lat: number;
  lng: number;
  content: React.ReactNode;
};

const SetMapRef: React.FC<{ mapRef: React.RefObject<LeafletMapType> }> = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
};

const MapClickHandler: React.FC<{ onClick: (lat: number, lng: number) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

function MapViewer() {
  const mapRef = useRef<LeafletMapType | null>(null);
  const suggestionCacheRef = useRef<NominatimSuggestion[]>([]);

  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [showInfoCard, setShowInfoCard] = useState(false);

  const showInfoForCoordinates = async (lat: number, lng: number, recenter: boolean) => {
    setSelected({
      lat,
      lng,
      content: <div className="w-64">Loading...</div>,
    });

    if (recenter && mapRef.current) {
      mapRef.current.setView([lat, lng], 14);
    }

    try {
      // Reverse geocode
      const gisData = await reverseGeocode(lat, lng);

      if (!gisData) {
        setSelected({
          lat,
          lng,
          content: <div className="w-64">Address not found</div>,
        });
        return;
      }

      // Find jurisdiction data
      const jurisdictionInfo = await findJurisdictionByCoordinate(lat, lng);

      setSelected({
        lat,
        lng,
        content: (
          <CoordinateInfoModal gisData={gisData} jurisdictionInfo={jurisdictionInfo} />
        ),
      });
    } catch (err) {
      console.error("Error fetching info by coordinates:", err);
      setSelected({
        lat,
        lng,
        content: <div className="w-64">Error fetching data</div>,
      });
    }
  }

  const fetchSuggestions = async (query: string): Promise<NominatimSuggestion[]> => {
    query = query.trim();
    if (!query) return [];

    const results = await geocodeAddress(query) as NominatimSuggestion[];
    suggestionCacheRef.current = results ? results : [];

    return suggestionCacheRef.current;
  };

  const showSuggestionOnMap = async (suggestion: NominatimSuggestion) => {
    const point = getInteriorPoint(suggestion.geojson);
    
    if (!point) {
      return;
    }

    const [lng, lat] = point;
    const [south, north, west, east] = suggestion.boundingbox.map(Number);

    setSelected({
      lat,
      lng,
      content: <div className="w-64">Loading...</div>,
    });

    if (mapRef.current) {
      mapRef.current.fitBounds(
        [
          [south, west],
          [north, east],
        ]
      );
    }

    showInfoForCoordinates(lat, lng, false);
  }

  const handleSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      alert("Please enter a valid address.");
      return;
    }

    try {
      const suggestions = await fetchSuggestions(trimmed);

      if (suggestions && suggestions.length > 0) {
        // Show first (most relevant) suggestion
        showSuggestionOnMap(suggestions[0]);
      } else {
        alert("No results found for the entered address.");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      alert("Error occurred during address search.");
      return;
    }
  }

  const onSuggestionClick = async (suggestion: NominatimSuggestion) => {
    showSuggestionOnMap(suggestion);
  }

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setSelected({
          lat: latitude,
          lng: longitude,
          content: <div className="w-64">Loading...</div>,
        });

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 14);
        }

        showInfoForCoordinates(latitude, longitude, false);
      },
      (error) => {
        alert("Unable to retrieve your location. Please check location permissions.");
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-3/4 flex justify-center items-center space-x-4">
          <SearchSection
            onSearch={handleSearch}
            onSuggestionsFetch={fetchSuggestions}
            onSuggestionClick={onSuggestionClick}
            onLocateClick={locateUser}
            onInfoClick={() => setShowInfoCard(true)}
          />
        </div>

        {showInfoCard && <InfoModal onClose={() => setShowInfoCard(false)} />}
      </div>

      <div className="flex justify-center h-[60vh] min-h-[400px] w-full flex-shrink-0 mt-8">
        <MapContainer
          center={[40.4406, -79.9959]}
          zoom={10}
          className="w-[90vw] h-full rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <SetMapRef mapRef={mapRef} />

          <MapClickHandler onClick={(lat, lng) => showInfoForCoordinates(lat, lng, false)} />

          {selected && (
            <Popup position={[selected.lat, selected.lng]} closeOnClick={false} autoClose={false}>
              {selected.content}
            </Popup>
          )}
        </MapContainer>
      </div>
    </>
  );
}

export default MapViewer;

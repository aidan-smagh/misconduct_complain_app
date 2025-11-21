import { JurisdictionInfo } from "@/lib/types/jurisdiction";
import { NominatimSuggestion } from "@/lib/types/nominatim";

export async function geocodeAddress(address) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&q=${encodeURIComponent(address)}`);
    const data = await res.json();

    return data as NominatimSuggestion[];
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&polygon_geojson=1`);
    const data = await res.json();

    if (data.error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

export async function findJurisdictionByCoordinate(lat, lon) {
  try {
    const res = await fetch(`/api/find_jurisdiction_by_coordinates?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    return data as JurisdictionInfo;
  } catch (error) {
    return null;
  }
}
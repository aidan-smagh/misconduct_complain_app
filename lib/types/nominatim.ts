import { Geometry } from "geojson";

export interface NominatimError {
  error: string;
}

export interface NominatimSuggestion {
  addresstype: string;
  boundingbox: [string, string, string, string];
  category: string;
  display_name: string;
  geojson: Geometry;
  importance: number;
  lat: string;
  lon: string;
  licence: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
}
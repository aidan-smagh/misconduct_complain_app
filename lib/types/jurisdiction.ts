import { GeometryCollection } from "geojson";

export interface JurisdictionInfo {
  id: string;
  gis: JurisidictionGisInfo;
  filing: JurisdictionFilingInfo;
  outline: GeometryCollection;
}

export interface JurisidictionGisInfo {
  name: string;
}

export interface JurisdictionFilingInfo {
  name?: string;
  documents: DocumentInfo[];
  methods: MethodInfo[];
  defer?: any;
}

export interface DocumentInfo {
  name: string;
  url: string;
  verified: boolean;
}

export interface MethodInfo {
  method: string;
  values: any[];
  notes: string;
  accepts: string[];
}


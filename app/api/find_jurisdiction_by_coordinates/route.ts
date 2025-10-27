import { NextRequest, NextResponse } from "next/server";
import { booleanPointInPolygon } from "@turf/turf";
import { db } from "@/firebaseConfig";
import { getAllGisData } from "@/lib/server/jurisdiction";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import jurisdictionBoundsJson from "@/lib/gis/AlleghenyCountyMunicipalBoundaries_6404275282653601599.json";

const jurisdictionBounds: FeatureCollection<Polygon | MultiPolygon> = jurisdictionBoundsJson as FeatureCollection<Polygon | MultiPolygon>;

async function getJurisdictionGis(id) {
  const index = await getAllGisData();
  return index[id];
}

async function getFilingInfo(id) {
  const infoRef = db.doc(`filing_info/${id}`);
  const infoSnap = await infoRef.get()

  return infoSnap.exists ? infoSnap.data() : null;
}

export async function GET(req: NextRequest) {
  // Get coordinates
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  // Check if required parameters are present
  if (!lat || !lon) {
    return new NextResponse(null, { status: 400 });
  }
  
  let point = [parseFloat(lon), parseFloat(lat)];

  // Find jurisdictions that contain the coordinate
  // invalid coordinates will return no results
  const intersections = jurisdictionBounds.features.filter(f => booleanPointInPolygon(point, f));

  if (intersections.length == 0) {
    return NextResponse.json(null);
  }
  
  // Use the first match for now
  const firstResult = intersections[0];
  const matched_id = firstResult.properties.JURISDICTION_ID;
  let filingInfo = await getFilingInfo(matched_id);
  
  // Resolve defer
  while (filingInfo && filingInfo.defer) {
    filingInfo = await getFilingInfo(filingInfo.defer);
  }

  let jurisdictionGis = await getJurisdictionGis(matched_id);

  return NextResponse.json({
    id: matched_id,
    gis: jurisdictionGis,
    filing: filingInfo
  });
}
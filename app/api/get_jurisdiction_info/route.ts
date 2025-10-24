import { NextResponse } from "next/server";
import { db } from "@/firebaseConfig";
import { getJurisdictionGis } from "@/lib/jurisdiction";

function getDefaultComplaintInfo() {
  return {
    last_updated: null,
    defer: null,
    methods: [],
    documents: [],
  }
}

export async function GET(req) {
  try {
    // Validate URL parameters
    const { searchParams } = new URL(req.url);
    const jurisdictionId = searchParams.get("id");

    if (!jurisdictionId) {
      return new NextResponse(null, { status: 400 });
    }

    // Check if the id exists
    const gis_info = await getJurisdictionGis(jurisdictionId);

    if (!gis_info) {
      return new NextResponse(null, { status: 404 });
    }

    // Query Firestore for complaints data
    let info;

    try {
      const docRef = db.doc(`filing_info/${jurisdictionId}`);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        info = docSnap.data();
      } else {
        info = getDefaultComplaintInfo();
      }
    } catch (error) {
      // Firestore error, probably not found
      info = getDefaultComplaintInfo();
    }

    if (info.defer) {
      let deferJurisdiction = await getJurisdictionGis(info.defer);

      info.defer = {
        value: info.defer,
        label: deferJurisdiction.name
      }
    }

    return NextResponse.json({ info: info, gisInfo: gis_info });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

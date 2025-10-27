import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebaseConfig";
import { getJurisdictionGis } from "@/lib/server/jurisdiction";

export async function GET(req: NextRequest) {
  // Validate URL parameters
  const jurisdictionId = req.nextUrl.searchParams.get("id");
  
  if (!jurisdictionId) {
    return new NextResponse(null, { status: 400 });
  }
  
  try {
    // Check if the id exists
    const gisInfo = await getJurisdictionGis(jurisdictionId);

    if (!gisInfo) {
      return new NextResponse(null, { status: 404 });
    }

    // Query Firestore for complaints data
    const docRef = db.doc(`filing_info/${jurisdictionId}`);
    const docSnap = await docRef.get();
    const filingInfo = docSnap.data() ?? null;

    if (filingInfo && filingInfo.defer) {
      let deferJurisdiction = await getJurisdictionGis(filingInfo.defer);

      filingInfo.defer = {
        value: filingInfo.defer,
        label: deferJurisdiction ? deferJurisdiction.name : "Unknown"
      }
    }

    return NextResponse.json({ gisInfo: gisInfo, filingInfo: filingInfo });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

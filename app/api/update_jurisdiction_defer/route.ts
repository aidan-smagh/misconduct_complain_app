import { NextResponse } from "next/server";
import { db } from "@/firebaseConfig";
import { doesJurisdictionExist } from "@/lib/server/jurisdiction";

export async function POST(req) {
  // Validate URL parameters
  const jurisdictionId = req.nextUrl.searchParams.get("id");

  if (!jurisdictionId) {
    return new NextResponse(null, { status: 400 });
  }

  // Get user submission
  let deferJurisdictionId;

  try {
    deferJurisdictionId = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (typeof deferJurisdictionId != "string") {
    return new NextResponse(null, { status: 400 });
  }

  try {
    // Check if jurisdictionId is valid
    if (!(await doesJurisdictionExist(jurisdictionId))) {
      return new NextResponse(null, { status: 404 });
    }

    // Ensure defer jurisdiction id is valid
    if (deferJurisdictionId && (!(await doesJurisdictionExist(deferJurisdictionId)) || jurisdictionId === deferJurisdictionId)) {
      return new NextResponse(null, { status: 400 });
    }

    const docRef = db.doc(`filing_info/${jurisdictionId}`);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      // Move existing data to history
      const currentData = docSnap.data();
      const colRef = db.collection(`revisions/${jurisdictionId}/versions`);
      await colRef.add(currentData);

      // Update document
      await docRef.update({
        last_updated: new Date().toISOString(),
        defer: deferJurisdictionId
      });
    } else {
      // Create new document
      docRef.set({
        last_updated: new Date().toISOString(),
        defer: deferJurisdictionId,
        methods: [],
        documents: [],
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
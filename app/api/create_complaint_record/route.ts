import { NextRequest, NextResponse } from "next/server";
import { ComplaintRecord } from "@/lib/types/community_tracker";
import { AuthenticatedSubmission } from "@/lib/types/account";
import { VALIDATION_SCHEMA } from "@/lib/validation/complaint_record_schema";
import { createComplaintRecord } from "@/lib/server/community_tracker";
import { auth } from "@/firebaseConfig";
import { doesJurisdictionExist } from "@/lib/server/jurisdiction";


export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as AuthenticatedSubmission<ComplaintRecord>;

    // Data validation
    try {
      VALIDATION_SCHEMA.validateSync(data.data);
    } catch (error) {
      console.log(error);
      return NextResponse.json(null, { status: 400 });
    }

    // Ensure jurisdiction id is valid
    if (!doesJurisdictionExist(data.data.jurisdiction.value)) {
      return NextResponse.json(null, { status: 400 });
    }

    // Ensure user is authenticated
    let decoded;

    try {
      decoded = await auth.verifyIdToken(data.idToken);
    } catch (err) {
      return NextResponse.json(null, { status: 401 });
    }

    // Create record
    try {
      const docId = await createComplaintRecord(data.data, decoded.uid);
      console.log(docId);

      return NextResponse.json(docId);
    } catch (err) {
      return NextResponse.json(null, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(null, { status: 500 });
  }
}

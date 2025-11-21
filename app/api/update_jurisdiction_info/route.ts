import { NextRequest, NextResponse } from "next/server";
import { VALIDATION_SCHEMA } from "@/lib/validation/jurisdiction_info_schema";
import { db } from "@/firebaseConfig";
import { doesJurisdictionExist } from "@/lib/server/jurisdiction";

function processData(data) {
  // Remove empty entries and strip entries of verified field
  let cleanedDocuments = [];

  for (let document of data.documents) {
    if (document.url) {
      cleanedDocuments.push({
        name: document.name.trim(),
        url: document.url.trim(),
      })
    }
  }

  data.documents = cleanedDocuments;

  for (let method of data.methods) {
    let cleanedValues = [];

    if (method.method === "online form") {
      for (let value of method.values) {
        if (value.value) {
          cleanedValues.push(value.value.trim());
        }
      }
    } else {
      for (let value of method.values) {
        if (value) {
          cleanedValues.push(value.trim());
        }
      }
    }

    method.values = cleanedValues;
  }

  data.defer = data.defer.value;
  data.last_updated = new Date().toISOString();
}

export async function POST(req: NextRequest) {
  // Validate URL parameters
  const jurisdictionId = req.nextUrl.searchParams.get("id");

  if (!jurisdictionId) {
    return new NextResponse(null, { status: 400 });
  }

  // Get user submission
  let data;

  try {
    data = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  try {
    // Check if jurisdictionId exists
    if (!(await doesJurisdictionExist(jurisdictionId))) {
      return new NextResponse(null, { status: 404 });
    }

    // Validate submission
    if (!VALIDATION_SCHEMA.isValidSync(data)) {
      return new NextResponse(null, { status: 400 });
    }

    // Additional check for defer field
    if (data.defer && (!(await doesJurisdictionExist(data.defer.value)) || jurisdictionId === data.defer.value)) {
      return new NextResponse(null, { status: 400 });
    }

    // Move existing data to history
    const docRef = db.doc(`filing_info/${jurisdictionId}`);
    const docSnap = await docRef.get();
    let archiveReq;

    if (docSnap.exists) {
      const currentData = docSnap.data();
      const colRef = db.collection(`revisions/${jurisdictionId}/versions`);
      archiveReq = colRef.add(currentData);
    }

    // Update database
    processData(data);
    await Promise.all([archiveReq, docRef.set(data)]);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
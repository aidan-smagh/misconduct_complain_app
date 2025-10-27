import { NextRequest, NextResponse } from "next/server";
import { VALIDATION_SCHEMA } from "@/lib/validation/editor_feedback_schema";
import { db } from "@/firebaseConfig";

export async function POST(req: NextRequest) {
  // Get user submission
  let data;

  try {
    data = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // Validate submission
  if (!VALIDATION_SCHEMA.isValidSync(data)) {
    return new NextResponse(null, { status: 400 });
  }

  // Add to database
  try {
    const colRef = db.collection("feedback");
    await colRef.add(data);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
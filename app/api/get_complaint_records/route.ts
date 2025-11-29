import { db } from "@/firebaseConfig";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db.collection("complaint_records").get();

    const records = snapshot.docs.map(doc => doc.data());

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}
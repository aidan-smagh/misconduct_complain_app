import { doesJurisdictionExist } from "@/lib/server/jurisdiction";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get user submission
    let name;

    try {
      name = await req.json();
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    // Data validation
    if (typeof name !== "string") {
      return new NextResponse(null, { status: 400 });
    }

    name = name.trim();

    if (name === "") {
      return new NextResponse(null, { status: 400 });
    }
    
    // Automatically generate ID from name
    let id = name.toUpperCase().replaceAll(" ", "_");
    
    return NextResponse.json(await doesJurisdictionExist(id));
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
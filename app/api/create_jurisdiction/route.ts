import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return new NextResponse(null, { status: 501 });
}
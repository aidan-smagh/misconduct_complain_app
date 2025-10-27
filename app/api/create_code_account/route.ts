import { VALIDATION_SCHEMA } from '@/lib/validation/code_account_schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Ensure body is JSON
  let data;
  
  try {
    data = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // Data validation
  if (!VALIDATION_SCHEMA.isValidSync(data)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    // Not implemented
    return new NextResponse(null, { status: 501 });
  } catch (error) {
    // Server error
    return new NextResponse(null, { status: 500 });
  }
}
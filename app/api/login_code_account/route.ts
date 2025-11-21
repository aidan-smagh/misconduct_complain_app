import { loginCodeAccount } from '@/lib/server/auth';
import { VALIDATION_SCHEMA } from '@/lib/validation/code_account_schema';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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

  // Clean data
  data = {
    code: data.code.trim().toLowerCase(),
    answers: data.answers.map(a => a.trim().toLowerCase())
  }

  try {
    const token = await loginCodeAccount(data.code, data.answers);

    return token ? NextResponse.json(token, { status: 200 }) : new NextResponse(null, { status: 401 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
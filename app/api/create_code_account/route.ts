import { createCodeAccount, login } from '@/lib/server/auth';
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
    const accountId = await createCodeAccount(data.code, data.answers);

    if (accountId) {
      // Success
      const customToken = await login(accountId);
      return NextResponse.json(customToken, { status: 200 });
    } else {
      // Code and answer combination already exists
      return new NextResponse(null, { status: 409 });
    }
  } catch (error) {
    // Server error
    return new NextResponse(null, { status: 500 });
  }
}
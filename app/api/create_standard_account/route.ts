import { VALIDATION_SCHEMA } from '@/lib/validation/standard_account_schema';
import { NextRequest, NextResponse } from 'next/server';
import { createEmailAccount, createUsernameAccount, login } from '@/lib/server/auth';

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
    identifier: data.identifier.trim().toLowerCase(),
    password: data.password.trim()
  }

  const isEmail = data.identifier.includes('@');

  try {
    const accountId = await (isEmail
      ? createEmailAccount(data.identifier, data.password)
      : createUsernameAccount(data.identifier, data.password));

    if (accountId) {
      // Success
      const customToken = await login(accountId);
      return NextResponse.json(customToken, { status: 200 });
    } else {
      // Identifier already in use
      return new NextResponse(null, { status: 409 });
    }
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
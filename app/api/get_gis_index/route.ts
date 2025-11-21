import { getAllGisData } from '@/lib/server/jurisdiction';
import { NextResponse } from 'next/server';

export async function GET() {
  let data;

  try {
    data = await getAllGisData();
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }

  return data ? NextResponse.json(data) : new NextResponse(null, { status: 404 });
}
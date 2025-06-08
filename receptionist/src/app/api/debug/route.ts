import { NextResponse } from 'next/server';

export async function GET() {
   return NextResponse.json({
      apiBase: process.env.NEXT_PUBLIC_API_BASE,
      message: 'Debug info returned successfully',
   });
}

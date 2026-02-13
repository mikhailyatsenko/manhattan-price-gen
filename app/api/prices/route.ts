import { NextResponse } from 'next/server';
import { fetchPrices } from '@/lib/googleSheets';

// Force dynamic to bypass Next.js static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const prices = await fetchPrices();
    
    // No cache headers - we manage caching in-memory in googleSheets.ts
    return NextResponse.json(prices, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in /api/prices:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

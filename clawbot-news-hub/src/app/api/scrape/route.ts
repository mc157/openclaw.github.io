import { NextRequest, NextResponse } from 'next/server';
import { scrapeSources } from '@/lib/aggregator';

export async function POST() {
  try {
    const newItems = await scrapeSources();
    return NextResponse.json({
      success: true,
      message: `Scraping completed. Found ${newItems.length} new items.`,
      items: newItems
    });
  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scrape sources' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST to trigger scraping',
    endpoints: {
      scrape: 'POST /api/scrape - Trigger manual scraping',
      status: 'GET /api/scrape/status - Get scraper status'
    }
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { getNews, refreshData } from '@/lib/aggregator';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const refresh = searchParams.get('refresh') === 'true';

  try {
    let news;

    if (refresh) {
      // Force refresh and return fresh data
      const aggregatedData = await refreshData();
      news = aggregatedData.items;
    } else {
      // Get cached data
      news = await getNews();
    }

    // Filter by category if specified
    let filteredNews = news;
    if (category) {
      filteredNews = news.filter(item => item.category === category);
    }

    // Apply pagination
    const paginatedNews = filteredNews.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedNews,
      pagination: {
        total: filteredNews.length,
        limit,
        offset,
        hasMore: offset + limit < filteredNews.length
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'refresh':
        const result = await refreshData();
        return NextResponse.json({
          success: true,
          message: 'Data refreshed successfully',
          data: result
        });

      case 'scrape':
        const scrapedData = await import('@/lib/aggregator').then(m => m.scrapeSources());
        return NextResponse.json({
          success: true,
          message: 'Scraping completed',
          data: await scrapedData
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in news POST API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
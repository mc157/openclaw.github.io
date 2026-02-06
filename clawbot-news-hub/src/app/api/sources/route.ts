import { NextResponse } from 'next/server';
import { scrapeSources } from '@/lib/aggregator';

export async function GET() {
  try {
    const sources = await scrapeSources();
    
    return NextResponse.json({
      success: true,
      data: {
        reddit: {
          count: sources.reddit?.length || 0,
          lastScraped: Date.now()
        },
        github: {
          count: sources.github?.length || 0,
          lastScraped: Date.now()
        },
        general: {
          count: sources.general?.length || 0,
          lastScraped: Date.now()
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in sources API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch sources data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
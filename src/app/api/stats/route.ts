import { NextResponse } from 'next/server';
import { getNews } from '@/lib/aggregator';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const news = await getNews();
    
    // Calculate statistics
    const stats = {
      totalItems: news.length,
      byCategory: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      averageScore: 0,
      latestUpdate: Date.now(),
      timeRange: {
        oldest: Math.min(...news.map(item => item.timestamp)),
        newest: Math.max(...news.map(item => item.timestamp))
      }
    };

    // Count by category
    news.forEach(item => {
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1;
    });

    // Calculate average score
    stats.averageScore = news.reduce((sum, item) => sum + item.score, 0) / news.length;

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in statistics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
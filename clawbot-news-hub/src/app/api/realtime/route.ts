import { NextRequest, NextResponse } from 'next/server';
import { refreshData } from '@/lib/aggregator';

// Simple WebSocket-like real-time update endpoint
// In a production environment, this would use actual WebSocket connections
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pollInterval = parseInt(searchParams.get('pollInterval') || '30000'); // 30 seconds default

  try {
    // Send initial data
    const initialData = await refreshData();
    
    // For now, return a simple response
    // In a real implementation, this would establish a WebSocket connection
    return NextResponse.json({
      success: true,
      data: {
        message: 'Real-time connection established',
        pollInterval,
        initialData: {
          itemCount: initialData.items.length,
          totalSources: initialData.totalSources,
          lastUpdated: initialData.lastUpdated
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error in real-time API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to establish real-time connection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      const result = await refreshData();
      
      return NextResponse.json({
        success: true,
        message: 'Real-time data refreshed',
        data: {
          itemCount: result.items.length,
          totalSources: result.totalSources,
          lastUpdated: result.lastUpdated
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in real-time POST API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process real-time request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
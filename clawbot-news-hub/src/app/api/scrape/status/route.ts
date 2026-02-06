import { NextResponse } from 'next/server';
import { scraperManager } from '@/lib/scraper-manager';

export async function GET() {
  try {
    const status = scraperManager.getScraperStatus();
    
    return NextResponse.json({
      success: true,
      status,
      isScheduling: scraperManager['scheduleInterval'] !== null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scraper status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, scraperName } = await request.json();
    
    let success = false;
    let message = '';
    
    switch (action) {
      case 'start':
        scraperManager.startScheduling(15);
        success = true;
        message = 'Started scheduled scraping';
        break;
        
      case 'stop':
        scraperManager.stopScheduling();
        success = true;
        message = 'Stopped scheduled scraping';
        break;
        
      case 'enable':
        if (scraperName) {
          success = await scraperManager.enableScraper(scraperName);
          message = success ? `Enabled ${scraperName} scraper` : `Scraper ${scraperName} not found`;
        } else {
          return NextResponse.json(
            { success: false, error: 'Scraper name required for enable action' },
            { status: 400 }
          );
        }
        break;
        
      case 'disable':
        if (scraperName) {
          success = await scraperManager.disableScraper(scraperName);
          message = success ? `Disabled ${scraperName} scraper` : `Scraper ${scraperName} not found`;
        } else {
          return NextResponse.json(
            { success: false, error: 'Scraper name required for disable action' },
            { status: 400 }
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: start, stop, enable, disable' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success, message });
  } catch (error) {
    console.error('Status control API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to control scraper status' },
      { status: 500 }
    );
  }
}
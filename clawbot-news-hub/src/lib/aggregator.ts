import { NewsItem, AggregatedNews } from './types';
import { db } from './database';
import { scraperManager } from './scraper-manager';

export async function getNews(category?: string, limit = 50): Promise<NewsItem[]> {
  try {
    await db.initialize();
    return await db.getNews(category, limit);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function getLatestNews(limit = 20): Promise<NewsItem[]> {
  try {
    await db.initialize();
    return await db.getLatestNews(limit);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
}

export async function scrapeSources(): Promise<NewsItem[]> {
  try {
    const newItems = await scraperManager.scrapeAll();
    return newItems;
  } catch (error) {
    console.error('Error scraping sources:', error);
    return [];
  }
}

export async function aggregateData(): Promise<AggregatedNews> {
  try {
    await db.initialize();
    const items = await getLatestNews(100);
    const categories = [...new Set(items.map(item => item.category))];
    
    const aggregated: AggregatedNews = {
      items,
      lastUpdated: Date.now(),
      totalSources: categories.length
    };

    return aggregated;
  } catch (error) {
    console.error('Error aggregating data:', error);
    return { items: [], lastUpdated: Date.now(), totalSources: 0 };
  }
}

// Initialize scraper manager with real-time update callback
scraperManager.setNewsUpdateCallback((newItems: NewsItem[]) => {
  console.log(`Real-time update: ${newItems.length} new news items added`);
});

// Start scheduled scraping
scraperManager.startScheduling(15); // Every 15 minutes
import { NewsItem, AggregatedNews, ScrapedData } from './types';
import { newsDatabase } from './database';
import { 
  createRedditScraper, 
  createGitHubScraper, 
  createTechBlogScraper 
} from './scrapers';

export async function getNews(): Promise<NewsItem[]> {
  try {
    // For GitHub Pages, use static data to avoid scraping during build
    const staticDataPath = process.env.NODE_ENV === 'production' 
      ? './data/scraped-data.json' 
      : './src/data/scraped-data.json';
    
    try {
      const fs = await import('fs');
      if (fs.existsSync(staticDataPath)) {
        const data = JSON.parse(fs.readFileSync(staticDataPath, 'utf8'));
        return data.items || [];
      }
    } catch (fsError) {
      console.log('Could not load static data, using fallback:', fsError);
    }
    
    // Fallback: get from database
    const dbNews = await newsDatabase.getNews();
    return dbNews.length > 0 ? dbNews : [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function scrapeSources(): Promise<ScrapedData> {
  // For GitHub Pages, return empty data to avoid scraping
  console.log('🔄 Using static data (no scraping for GitHub Pages)');
  
  return {
    reddit: [],
    github: [],
    general: []
  };
}

export async function refreshData(): Promise<AggregatedNews> {
  console.log('🔄 Starting data refresh...');
  
  try {
    // For GitHub Pages, just return existing data instead of scraping
    const news = await getNews();
    console.log(`✅ Data refresh completed. ${news.length} items from 3 sources (static mode).`);
    
    return {
      items: news,
      totalSources: 3,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error during data refresh:', error);
    return { items: [], totalSources: 0, lastUpdated: Date.now() };
  }
}

export async function addNewsItem(item: NewsItem): Promise<void> {
  try {
    await newsDatabase.saveNews([item]);
    console.log('✅ News item added successfully');
  } catch (error) {
    console.error('Error adding news item:', error);
    throw error;
  }
}

export async function getDatabaseStats() {
  try {
    const stats = await newsDatabase.getStats();
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      totalItems: 0,
      oldestItem: null,
      newestItem: null,
      byCategory: {}
    };
  }
}

export async function cleanupOldData(daysOld: number = 7): Promise<void> {
  try {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    await newsDatabase.cleanupOldItems(cutoffDate);
    console.log('✅ Cleaned up old data');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  }
}
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
          url: 'https://github.com/trending',
          type: 'json',
          category: 'General'
        },
        {
          name: 'Mozilla Hacks',
          url: 'https://hacks.mozilla.org/feed/',
          type: 'rss',
          category: 'API'
        },
        {
          name: 'AWS Blog',
          url: 'https://aws.amazon.com/blogs/feed/',
          type: 'rss',
          category: 'API'
        }
      ],
      maxItemsPerFeed: 8
    });
    
    scrapedData.general = await techBlogScraper.scrape();

    // Combine all scraped data
    const allScrapedItems = [
      ...scrapedData.reddit,
      ...scrapedData.github,
      ...scrapedData.general
    ];

    console.log('📊 Scraping completed:', {
      reddit: scrapedData.reddit.length,
      github: scrapedData.github.length,
      general: scrapedData.general.length,
      total: allScrapedItems.length
    });

    // Save to database
    await newsDatabase.saveNews(allScrapedItems);

    return scrapedData;
  } catch (error) {
    console.error('Error in scrapeSources:', error);
    return scrapedData;
  }
}

export async function aggregateData(): Promise<AggregatedNews> {
  try {
    console.log('📊 Starting data aggregation...');
    
    // Get data from database
    const dbData = await newsDatabase.getAggregatedNews();
    
    // If database is empty, scrape fresh data
    if (dbData.items.length === 0) {
      console.log('📭 Database is empty, scraping fresh data...');
      await scrapeSources();
      const freshData = await newsDatabase.getAggregatedNews();
      return freshData;
    }

    console.log(`✅ Aggregated ${dbData.items.length} items from ${dbData.totalSources} sources`);
    return dbData;
  } catch (error) {
    console.error('Error aggregating data:', error);
    return { items: [], lastUpdated: Date.now(), totalSources: 0 };
  }
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
    await newsDatabase.addNewsItem(item);
    console.log(`✅ Added news item: ${item.title}`);
  } catch (error) {
    console.error('Error adding news item:', error);
    throw error;
  }
}

export async function cleanupOldData(): Promise<void> {
  try {
    await newsDatabase.cleanupOldItems(7 * 24 * 60 * 60 * 1000); // 7 days
    console.log('✅ Cleaned up old data');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  }
}

export async function getDatabaseStats() {
  try {
    return await newsDatabase.getStats();
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}
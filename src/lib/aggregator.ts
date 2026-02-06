import { NewsItem, AggregatedNews, ScrapedData } from './types';
import { newsDatabase } from './database';
import { 
  createRedditScraper, 
  createGitHubScraper, 
  createTechBlogScraper 
} from './scrapers';

export async function getNews(): Promise<NewsItem[]> {
  try {
    // Try to get from database first
    const dbNews = await newsDatabase.getNews();
    
    // If database is empty or we want fresh data, aggregate new data
    if (dbNews.length === 0) {
      console.log('📭 Database is empty, aggregating fresh data...');
      const aggregated = await aggregateData();
      return aggregated.items;
    }
    
    return dbNews;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function scrapeSources(): Promise<ScrapedData> {
  const scrapedData: ScrapedData = {
    reddit: [],
    github: [],
    general: []
  };

  try {
    console.log('🕷️  Starting scraping process...');
    
    // Reddit scraping
    console.log('📡 Scraping Reddit...');
    const redditScraper = createRedditScraper({
      subreddits: ['programming', 'technology', 'webdev', 'machinelearning', 'LocalLLaMA', 'AI'],
      limit: 15,
      timeFilter: 'day'
    });
    
    scrapedData.reddit = await redditScraper.scrape();

    // GitHub scraping
    console.log('🐙 Scraping GitHub...');
    const githubScraper = createGitHubScraper({
      topics: ['api', 'machine-learning', 'javascript', 'python', 'web-development', 'ai', 'llm'],
      limit: 20,
      includeIssues: true,
      includeDiscussions: false
    });
    
    scrapedData.github = await githubScraper.scrape();

    // Tech blogs scraping
    console.log('📰 Scraping tech blogs...');
    const techBlogScraper = createTechBlogScraper({
      feeds: [
        {
          name: 'TechCrunch',
          url: 'https://techcrunch.com/feed/',
          type: 'rss',
          category: 'General'
        },
        {
          name: 'Hacker News',
          url: 'https://hnrss.org/newest',
          type: 'rss',
          category: 'General'
        },
        {
          name: 'Dev.to',
          url: 'https://dev.to/feed',
          type: 'rss',
          category: 'How-To'
        },
        {
          name: 'GitHub Trending',
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
    // Scrape fresh data
    await scrapeSources();
    
    // Get updated aggregated data
    const result = await newsDatabase.getAggregatedNews();
    
    console.log(`✅ Data refresh completed. ${result.items.length} items from ${result.totalSources} sources.`);
    return result;
  } catch (error) {
    console.error('Error during data refresh:', error);
    // Return existing data even if refresh fails
    return await newsDatabase.getAggregatedNews();
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
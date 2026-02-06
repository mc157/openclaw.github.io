import { BaseScraper } from './base';
import { RedditScraper, GitHubScraper, TechNewsScraper } from './sources';
import { db } from '../database';
import { NewsItem } from '../types';

export class ScraperManager {
  private scrapers: BaseScraper[] = [];
  private isRunning = false;
  private scheduleInterval: NodeJS.Timeout | null = null;
  private onNewsUpdate?: (items: NewsItem[]) => void;

  constructor() {
    this.initializeScrapers();
  }

  private initializeScrapers(): void {
    this.scrapers = [
      new RedditScraper(),
      new GitHubScraper(),
      new TechNewsScraper()
    ];
  }

  setNewsUpdateCallback(callback: (items: NewsItem[]) => void): void {
    this.onNewsUpdate = callback;
  }

  async scrapeAll(): Promise<NewsItem[]> {
    if (this.isRunning) {
      console.log('Scraping already in progress...');
      return [];
    }

    this.isRunning = true;
    const allNewItems: NewsItem[] = [];

    try {
      console.log('Starting comprehensive scraping session...');
      
      for (const scraper of this.scrapers) {
        console.log(`Running ${scraper.constructor.name}...`);
        try {
          const items = await scraper.scrapeIfAllowed();
          allNewItems.push(...items);
          console.log(`Found ${items.length} new items from ${scraper.constructor.name}`);
        } catch (error) {
          console.error(`Error running ${scraper.constructor.name}:`, error);
        }
      }

      // Trigger callback if new items found
      if (allNewItems.length > 0 && this.onNewsUpdate) {
        this.onNewsUpdate(allNewItems);
      }

      // Clean up old news
      const removedCount = await db.clearOldNews(30);
      if (removedCount > 0) {
        console.log(`Removed ${removedCount} old news items`);
      }

      console.log(`Scraping completed. Found ${allNewItems.length} new items.`);
      return allNewItems;

    } catch (error) {
      console.error('Error during scraping session:', error);
      return [];
    } finally {
      this.isRunning = false;
    }
  }

  startScheduling(intervalMinutes = 15): void {
    if (this.scheduleInterval) {
      this.stopScheduling();
    }

    console.log(`Starting scheduled scraping every ${intervalMinutes} minutes...`);
    
    this.scheduleInterval = setInterval(async () => {
      try {
        await this.scrapeAll();
      } catch (error) {
        console.error('Error in scheduled scraping:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // Run immediately on start
    this.scrapeAll();
  }

  stopScheduling(): void {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
      console.log('Stopped scheduled scraping');
    }
  }

  getScraperStatus(): Array<{ name: string; enabled: boolean; lastScrape: number }> {
    return this.scrapers.map(scraper => ({
      name: scraper.constructor.name,
      enabled: scraper['config'].enabled,
      lastScrape: scraper['lastScrape']
    }));
  }

  async enableScraper(scraperName: string): Promise<boolean> {
    const scraper = this.scrapers.find(s => s.constructor.name === scraperName);
    if (scraper) {
      scraper['config'].enabled = true;
      console.log(`Enabled ${scraperName} scraper`);
      return true;
    }
    return false;
  }

  async disableScraper(scraperName: string): Promise<boolean> {
    const scraper = this.scrapers.find(s => s.constructor.name === scraperName);
    if (scraper) {
      scraper['config'].enabled = false;
      console.log(`Disabled ${scraperName} scraper`);
      return true;
    }
    return false;
  }
}

export const scraperManager = new ScraperManager();
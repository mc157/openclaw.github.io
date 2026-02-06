import axios from 'axios';
import { NewsItem } from './types';
import { db } from './database';

export interface ScraperConfig {
  name: string;
  enabled: boolean;
  interval: number; // minutes
  rateLimit: number; // ms between requests
  maxItems: number;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected lastScrape = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  abstract scrape(): Promise<NewsItem[]>;

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async makeRequest(url: string, options = {}): Promise<any> {
    const now = Date.now();
    const timeSinceLast = now - this.lastScrape;
    const requiredDelay = Math.max(0, this.config.rateLimit - timeSinceLast);
    
    if (requiredDelay > 0) {
      await this.delay(requiredDelay);
    }

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NewsAggregator/1.0)',
          ...options.headers
        },
        ...options
      });
      
      this.lastScrape = Date.now();
      return response.data;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw error;
    }
  }

  async scrapeIfAllowed(): Promise<NewsItem[]> {
    if (!this.config.enabled) {
      return [];
    }

    const now = Date.now();
    const timeSinceLast = now - this.lastScrape;
    const shouldScrape = timeSinceLast >= (this.config.interval * 60 * 1000);

    if (shouldScrape) {
      try {
        const items = await this.scrape();
        this.lastScrape = now;
        
        // Save to database
        for (const item of items.slice(0, this.config.maxItems)) {
          await db.addNews(item);
        }
        
        return items;
      } catch (error) {
        console.error(`Error in ${this.config.name} scraper:`, error);
        return [];
      }
    }

    return [];
  }
}
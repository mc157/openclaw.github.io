import axios from 'axios';
import { NewsItem } from '../types';

export interface TechBlogScraperConfig {
  feeds: TechBlogFeed[];
  maxItemsPerFeed: number;
}

export interface TechBlogFeed {
  name: string;
  url: string;
  type: 'rss' | 'atom' | 'json';
  selector?: string; // For web scraping fallback
  category?: NewsItem['category'];
}

export class TechBlogScraper {
  private config: TechBlogScraperConfig;

  constructor(config: TechBlogScraperConfig) {
    this.config = config;
  }

  async scrape(): Promise<NewsItem[]> {
    // For GitHub Pages, return empty array to avoid scraping
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Skipping tech blogs scraping in production (GitHub Pages)');
      return [];
    }
    
    const items: NewsItem[] = [];
    
    for (const feed of this.config.feeds) {
      try {
        const feedItems = await this.scrapeFeed(feed);
        items.push(...feedItems.slice(0, this.config.maxItemsPerFeed));
      } catch (error) {
        console.error(`Error scraping tech blog feed "${feed.name}":`, error);
      }
    }

    return items;
  }

  private async scrapeFeed(feed: TechBlogFeed): Promise<NewsItem[]> {
    switch (feed.type) {
      case 'rss':
      case 'atom':
        return this.scrapeRSSFeed(feed);
      case 'json':
        return this.scrapeJSONFeed(feed);
      default:
        return this.scrapeWebFeed(feed);
    }
  }

  private async scrapeRSSFeed(feed: TechBlogFeed): Promise<NewsItem[]> {
    try {
      // Use a CORS proxy to fetch RSS feeds
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
      const response = await axios.get(proxyUrl);
      const data = response.data.contents;

      // Parse RSS feed (simplified parsing)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      return Array.from(items).map((item, index) => {
        const title = item.querySelector('title')?.textContent || '';
        const content = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const creator = item.querySelector('creator')?.textContent || 
                       item.querySelector('author')?.textContent;

        return {
          id: `${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          title,
          description: this.cleanHTML(content),
          source: feed.name,
          url: link,
          author: creator,
          timestamp: pubDate ? new Date(pubDate).getTime() : Date.now(),
          category: feed.category || this.categorizeContent(title + ' ' + content),
          score: this.calculateScore(title, content)
        };
      });
    } catch (error) {
      console.error(`Error scraping RSS feed "${feed.name}":`, error);
      return [];
    }
  }

  private async scrapeJSONFeed(feed: TechBlogFeed): Promise<NewsItem[]> {
    try {
      const response = await axios.get(feed.url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OpenClaw-NewsHub/1.0.0'
        }
      });

      const feedData = response.data;
      const items = feedData.items || [];

      return items.map((item: any, index: number) => ({
        id: `${feed.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        title: item.title || '',
        description: this.cleanHTML(item.content || item.summary || ''),
        source: feed.name,
        url: item.url || '',
        author: item.author?.name || item.author,
        timestamp: item.date_published ? new Date(item.date_published).getTime() : Date.now(),
        category: feed.category || this.categorizeContent((item.title || '') + ' ' + (item.content || '')),
        score: this.calculateScore(item.title || '', item.content || '')
      }));
    } catch (error) {
      console.error(`Error scraping JSON feed "${feed.name}":`, error);
      return [];
    }
  }

  private async scrapeWebFeed(feed: TechBlogFeed): Promise<NewsItem[]> {
    // This would use Puppeteer for web scraping
    // For now, return empty array
    return [];
  }

  private cleanHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private categorizeContent(content: string): NewsItem['category'] {
    const text = content.toLowerCase();
    
    const categories = {
      'API': ['api', 'endpoint', 'rest', 'graphql', 'http', 'websocket', 'rpc'],
      'Models': ['model', 'ai', 'ml', 'machine learning', 'llm', 'gpt', 'claude', 'transformer', 'neural'],
      'How-To': ['how to', 'tutorial', 'guide', 'step by step', 'walkthrough', 'learn'],
      'ClawBot': ['clawbot', 'openclaw', 'bot', 'automation', 'assistant'],
      'General': ['news', 'update', 'release', 'announcement', 'product', 'feature']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category as NewsItem['category'];
      }
    }

    return 'General';
  }

  private calculateScore(title: string, content: string): number {
    // Simple scoring based on title length, content quality, and keyword presence
    let score = 50; // Base score
    
    // Bonus for longer titles (more descriptive)
    score += Math.min(title.length * 2, 30);
    
    // Bonus for longer content (more substantial)
    score += Math.min(content.length / 10, 20);
    
    // Bonus for certain keywords that indicate important content
    const importantKeywords = ['breakthrough', 'release', 'major', 'significant', 'important', 'critical'];
    const hasImportantKeywords = importantKeywords.some(keyword => 
      (title + content).toLowerCase().includes(keyword)
    );
    
    if (hasImportantKeywords) {
      score += 25;
    }
    
    return Math.min(score, 100);
  }
}

export function createTechBlogScraper(config: TechBlogScraperConfig): TechBlogScraper {
  return new TechBlogScraper(config);
}
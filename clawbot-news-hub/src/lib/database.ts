import { NewsItem } from '../types';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');

export class NewsDatabase {
  private static instance: NewsDatabase;
  private newsItems: NewsItem[] = [];

  private constructor() {}

  static getInstance(): NewsDatabase {
    if (!NewsDatabase.instance) {
      NewsDatabase.instance = new NewsDatabase();
    }
    return NewsDatabase.instance;
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
      const data = await fs.readFile(NEWS_FILE, 'utf-8');
      this.newsItems = JSON.parse(data);
    } catch {
      this.newsItems = [];
      await this.save();
    }
  }

  async save(): Promise<void> {
    await fs.writeFile(NEWS_FILE, JSON.stringify(this.newsItems, null, 2));
  }

  async addNews(item: NewsItem): Promise<void> {
    // Remove duplicate by URL
    this.newsItems = this.newsItems.filter(news => news.url !== item.url);
    
    // Add new item
    this.newsItems.unshift(item);
    
    // Keep only last 1000 items
    if (this.newsItems.length > 1000) {
      this.newsItems = this.newsItems.slice(0, 1000);
    }
    
    await this.save();
  }

  async getNews(category?: string, limit = 50): Promise<NewsItem[]> {
    let filtered = this.newsItems;
    
    if (category) {
      filtered = this.newsItems.filter(item => item.category === category);
    }
    
    return filtered.slice(0, limit);
  }

  async getLatestNews(limit = 20): Promise<NewsItem[]> {
    return this.newsItems.slice(0, limit);
  }

  async clearOldNews(olderThanDays = 30): Promise<number> {
    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const beforeCount = this.newsItems.length;
    
    this.newsItems = this.newsItems.filter(item => item.timestamp > cutoffDate);
    
    const removedCount = beforeCount - this.newsItems.length;
    if (removedCount > 0) {
      await this.save();
    }
    
    return removedCount;
  }
}

export const db = NewsDatabase.getInstance();
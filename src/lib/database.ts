import { promises as fs } from 'fs';
import path from 'path';
import { NewsItem, AggregatedNews } from './types';

export interface DatabaseConfig {
  dataDirectory: string;
  backupInterval: number; // in milliseconds
  maxBackups: number;
}

export class NewsDatabase {
  private config: DatabaseConfig;
  private dataDir: string;
  private dbPath: string;
  private backupDir: string;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.dataDir = config.dataDirectory;
    this.dbPath = path.join(this.dataDir, 'news-data.json');
    this.backupDir = path.join(this.dataDir, 'backups');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
    
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async saveNews(items: NewsItem[]): Promise<void> {
    try {
      const data = {
        items,
        timestamp: Date.now(),
        version: '1.0'
      };

      await this.writeWithBackup(data);
      console.log(`✅ Saved ${items.length} news items to database`);
    } catch (error) {
      console.error('❌ Error saving news to database:', error);
      throw error;
    }
  }

  async getNews(): Promise<NewsItem[]> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.items || [];
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // Database file doesn't exist, return empty array
        return [];
      }
      console.error('❌ Error reading news from database:', error);
      throw error;
    }
  }

  async getAggregatedNews(): Promise<AggregatedNews> {
    try {
      const items = await this.getNews();
      const sources = new Set(items.map(item => item.source));
      
      return {
        items,
        lastUpdated: items.length > 0 ? Math.max(...items.map(item => item.timestamp)) : Date.now(),
        totalSources: sources.size
      };
    } catch (error) {
      console.error('❌ Error getting aggregated news:', error);
      return {
        items: [],
        lastUpdated: Date.now(),
        totalSources: 0
      };
    }
  }

  async addNewsItem(item: NewsItem): Promise<void> {
    try {
      const existingItems = await this.getNews();
      
      // Check if item already exists
      const exists = existingItems.some(existing => existing.id === item.id);
      if (exists) {
        console.log(`⚠️  News item ${item.id} already exists, skipping`);
        return;
      }

      // Add new item
      const updatedItems = [...existingItems, item];
      await this.saveNews(updatedItems);
      
      console.log(`✅ Added new news item: ${item.title}`);
    } catch (error) {
      console.error('❌ Error adding news item:', error);
      throw error;
    }
  }

  async cleanupOldItems(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const items = await this.getNews();
      const cutoff = Date.now() - maxAge;
      
      const filteredItems = items.filter(item => item.timestamp > cutoff);
      
      if (filteredItems.length < items.length) {
        const removed = items.length - filteredItems.length;
        await this.saveNews(filteredItems);
        console.log(`🧹 Removed ${removed} old news items`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up old items:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalItems: number;
    categories: Record<string, number>;
    sources: Record<string, number>;
    dateRange: { oldest: number; newest: number };
  }> {
    try {
      const items = await this.getNews();
      
      const categories: Record<string, number> = {};
      const sources: Record<string, number> = {};
      let oldest = Infinity;
      let newest = 0;

      items.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
        sources[item.source] = (sources[item.source] || 0) + 1;
        oldest = Math.min(oldest, item.timestamp);
        newest = Math.max(newest, item.timestamp);
      });

      return {
        totalItems: items.length,
        categories,
        sources,
        dateRange: {
          oldest: oldest === Infinity ? Date.now() : oldest,
          newest
        }
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }

  private async writeWithBackup(data: any): Promise<void> {
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `news-data-${timestamp}.json`);
    
    try {
      await fs.writeFile(backupPath, JSON.stringify(data, null, 2));
      
      // Clean up old backups
      await this.cleanupOldBackups();
    } catch (error) {
      console.warn('⚠️  Failed to create backup, continuing with main save...');
    }

    // Write main file
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('news-data-') && file.endsWith('.json'))
        .sort()
        .reverse();

      // Remove old backups beyond maxBackups
      const toRemove = backupFiles.slice(this.config.maxBackups);
      for (const file of toRemove) {
        await fs.unlink(path.join(this.backupDir, file));
      }
    } catch (error) {
      console.warn('⚠️  Failed to cleanup old backups:', error);
    }
  }
}

// Create a singleton instance
export const newsDatabase = new NewsDatabase({
  dataDirectory: path.join(process.cwd(), 'data'),
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxBackups: 7
});
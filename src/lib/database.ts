import { promises as fs } from 'fs';
import path from 'path';
import { NewsItem, AggregatedNews } from './types';

export class NewsDatabase {
  private dataDir: string;
  private dbPath: string;
  private backupDir: string;

  constructor(dataDirectory: string = './data') {
    this.dataDir = dataDirectory;
    this.dbPath = path.join(this.dataDir, 'news-data.json');
    this.backupDir = path.join(this.dataDir, 'backups');
    
    // For GitHub Pages, ensure data directory exists
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    // For GitHub Pages, use static data or create minimal structure
    if ((process.env.NODE_ENV as string) === 'production') {
      return; // Skip directory creation in production (GitHub Pages)
    }
    
    try {
      await fs.access(this.dataDir);
    } catch {
      try {
        await fs.mkdir(this.dataDir, { recursive: true });
      } catch {
        // Ignore errors in production
      }
    }
  }

  async saveNews(items: NewsItem[]): Promise<void> {
    // For GitHub Pages, skip saving in production
    if ((process.env.NODE_ENV as string) === 'production') {
      console.log('✅ Skipping database save in production (GitHub Pages)');
      return;
    }
    
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
      // Don't throw in production
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
    }
  }

  async getNews(): Promise<NewsItem[]> {
    try {
      // For GitHub Pages, try to read from static data first
      const staticDataPath = (process.env.NODE_ENV as string) === 'production' 
        ? './data/scraped-data.json' 
        : this.dbPath;
      
      const data = await fs.readFile(staticDataPath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.items || [];
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // Database file doesn't exist, return empty array
        return [];
      }
      console.error('❌ Error reading news from database:', error);
      // Don't throw in production
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
      return [];
    }
  }

  async getAggregatedNews(): Promise<AggregatedNews> {
    try {
      const items = await this.getNews();
      const sources = new Set(items.map(item => item.source));
      
      return {
        items,
        totalSources: sources.size,
        lastUpdated: items.length > 0 ? Math.max(...items.map(item => item.timestamp)) : Date.now()
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
    // For GitHub Pages, skip adding items in production
    if ((process.env.NODE_ENV as string) === 'production') {
      console.log('✅ Skipping add news item in production (GitHub Pages)');
      return;
    }
    
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
      // Don't throw in production
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
    }
  }

  async cleanupOldItems(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // For GitHub Pages, skip cleanup in production
    if ((process.env.NODE_ENV as string) === 'production') {
      console.log('✅ Skipping cleanup in production (GitHub Pages)');
      return;
    }
    
    try {
      const items = await this.getNews();
      const cutoff = Date.now() - maxAge;
      
      const filteredItems = items.filter(item => item.timestamp > cutoff);
      
      if (filteredItems.length < items.length) {
        const removed = items.length - filteredItems.length;
        await this.saveNews(filteredItems);
        console.log(`🧹 Removed ${removed} old news items`);
      } else {
        console.log('✅ No old items to remove');
      }
    } catch (error) {
      console.error('❌ Error cleaning up old items:', error);
      // Don't throw in production
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
    }
  }

  async getStats() {
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
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
      return {
        totalItems: 0,
        categories: {},
        sources: {},
        dateRange: { oldest: Date.now(), newest: Date.now() }
      };
    }
  }

  private async writeWithBackup(data: any): Promise<void> {
    // For GitHub Pages, skip writing in production
    if ((process.env.NODE_ENV as string) === 'production') {
      return;
    }
    
    try {
      // Create backup first
      await this.createBackup();
      
      // Write new data
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error writing to database:', error);
      // Don't throw in production
      if ((process.env.NODE_ENV as string) !== 'production') {
        throw error;
      }
    }
  }

  private async createBackup(): Promise<void> {
    try {
      if (!(await this.fileExists(this.dbPath))) {
        return; // No file to backup
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.json`);
      
      await fs.copyFile(this.dbPath, backupPath);
      
      // Clean up old backups
      await this.cleanupOldBackups();
    } catch (error) {
      console.warn('⚠️  Failed to create backup:', error);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: null as any
        }));

      // Sort by modification time (newest first)
      for (const file of backupFiles) {
        file.stats = await fs.stat(file.path);
      }

      backupFiles.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Remove old backups
      const toRemove = backupFiles.slice(5); // Keep last 5 backups
      for (const file of toRemove) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      console.warn('⚠️  Failed to cleanup old backups:', error);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance for convenience
export const newsDatabase = new NewsDatabase();
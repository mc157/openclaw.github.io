import { BaseScraper, ScraperConfig } from './base';
import { NewsItem } from '../types';

export const redditConfig: ScraperConfig = {
  name: 'Reddit',
  enabled: true,
  interval: 30, // 30 minutes
  rateLimit: 2000, // 2 seconds between requests
  maxItems: 10
};

export class RedditScraper extends BaseScraper {
  constructor() {
    super(redditConfig);
  }

  async scrape(): Promise<NewsItem[]> {
    const items: NewsItem[] = [];
    
    // Scrape r/LocalLLaMA for AI news
    try {
      const response = await this.makeRequest('https://www.reddit.com/r/LocalLLaMA/new.json?limit=10');
      
      if (response?.data?.children) {
        for (const post of response.data.children) {
          const data = post.data;
          
          if (data.title && data.url && !data.url.includes('reddit.com')) {
            const item: NewsItem = {
              id: `reddit-${data.id}`,
              title: data.title,
              content: data.selftext || data.title,
              source: 'Reddit',
              url: data.url,
              author: data.author,
              timestamp: data.created_utc * 1000,
              category: 'Models',
              score: Math.floor(data.score * 0.8 + data.upvote_ratio * 20), // Calculate relevance score
              imageUrl: data.thumbnail && data.thumbnail !== 'self' ? data.thumbnail : undefined
            };
            
            items.push(item);
          }
        }
      }
    } catch (error) {
      console.error('Error scraping Reddit:', error);
    }

    return items;
  }
}

// GitHub scraper for OpenClaw updates
export const githubConfig: ScraperConfig = {
  name: 'GitHub',
  enabled: true,
  interval: 60, // 1 hour
  rateLimit: 1000, // 1 second between requests
  maxItems: 5
};

export class GitHubScraper extends BaseScraper {
  private readonly GITHUB_API_URL = 'https://api.github.com';
  private readonly REPO_OWNER = 'openclaw';
  private readonly REPO_NAME = 'openclaw';

  constructor() {
    super(githubConfig);
  }

  async scrape(): Promise<NewsItem[]> {
    const items: NewsItem[] = [];
    
    try {
      // Get recent commits
      const commitsResponse = await this.makeRequest(
        `${this.GITHUB_API_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/commits?per_page=5`
      );
      
      if (commitsResponse) {
        for (const commit of commitsResponse) {
          const item: NewsItem = {
            id: `github-${commit.sha}`,
            title: `New commit: ${commit.commit.message.split('\n')[0]}`,
            content: commit.commit.message,
            source: 'GitHub',
            url: commit.html_url,
            author: commit.author?.login || commit.commit.author?.name,
            timestamp: new Date(commit.commit.author.date).getTime(),
            category: 'ClawBot',
            score: 75
          };
          
          items.push(item);
        }
      }
      
      // Get recent releases
      const releasesResponse = await this.makeRequest(
        `${this.GITHUB_API_URL}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/releases?per_page=3`
      );
      
      if (releasesResponse) {
        for (const release of releasesResponse) {
          const item: NewsItem = {
            id: `github-release-${release.id}`,
            title: `Release: ${release.name}`,
            content: release.body || release.name,
            source: 'GitHub',
            url: release.html_url,
            author: release.author?.login,
            timestamp: new Date(release.published_at).getTime(),
            category: 'ClawBot',
            score: 90
          };
          
          items.push(item);
        }
      }
    } catch (error) {
      console.error('Error scraping GitHub:', error);
    }

    return items;
  }
}

// General tech news scraper
export const techNewsConfig: ScraperConfig = {
  name: 'TechNews',
  enabled: true,
  interval: 120, // 2 hours
  rateLimit: 3000, // 3 seconds between requests
  maxItems: 8
};

export class TechNewsScraper extends BaseScraper {
  constructor() {
    super(techNewsConfig);
  }

  async scrape(): Promise<NewsItem[]> {
    const items: NewsItem[] = [];
    
    try {
      // Use RSS feeds from various tech sources
      const feeds = [
        'https://feeds.feedburner.com/oreilly/radar',
        'https://techcrunch.com/feed/',
        'https://www.smashingmagazine.com/feed/'
      ];
      
      for (const feed of feeds) {
        try {
          // For now, we'll simulate RSS parsing with mock data
          // In a real implementation, you'd use an RSS parser library
          const mockItems = this.generateMockTechNews();
          items.push(...mockItems.slice(0, 2)); // Add 2 items per feed
        } catch (error) {
          console.error(`Error processing feed ${feed}:`, error);
        }
      }
    } catch (error) {
      console.error('Error scraping tech news:', error);
    }

    return items;
  }

  private generateMockTechNews(): NewsItem[] {
    return [
      {
        id: `tech-${Date.now()}-${Math.random()}`,
        title: 'New AI Model Breaks Performance Records',
        content: 'Researchers have developed a new AI model that demonstrates unprecedented performance in natural language understanding.',
        source: 'Tech News',
        url: 'https://example.com/ai-breakthrough',
        timestamp: Date.now() - 3600000,
        category: 'Models',
        score: 85
      },
      {
        id: `tech-${Date.now()}-${Math.random()}`,
        title: 'Open Source Framework Gains Popularity',
        content: 'A new open-source framework for AI development is gaining traction among developers worldwide.',
        source: 'Tech News',
        url: 'https://example.com/opensource-framework',
        timestamp: Date.now() - 7200000,
        category: 'API',
        score: 75
      }
    ];
  }
}
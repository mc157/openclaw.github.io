import axios from 'axios';
import { NewsItem } from '../types';

export interface GitHubScraperConfig {
  topics: string[];
  limit: number;
  includeIssues: boolean;
  includeDiscussions: boolean;
}

export class GitHubScraper {
  private config: GitHubScraperConfig;
  private readonly API_BASE = 'https://api.github.com';
  private readonly SEARCH_HEADERS = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenClaw-NewsHub/1.0.0'
  };

  constructor(config: GitHubScraperConfig) {
    this.config = config;
  }

  async scrape(): Promise<NewsItem[]> {
    // For GitHub Pages, return empty array to avoid scraping
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Skipping GitHub scraping in production (GitHub Pages)');
      return [];
    }
    
    const items: NewsItem[] = [];
    
    for (const topic of this.config.topics) {
      try {
        // Search for trending repositories with the topic
        const repos = await this.searchTrendingRepos(topic);
        items.push(...repos);
        
        // Include issues if enabled
        if (this.config.includeIssues) {
          const issues = await this.searchRecentIssues(topic);
          items.push(...issues);
        }
        
        // Include discussions if enabled
        if (this.config.includeDiscussions) {
          const discussions = await this.searchDiscussions(topic);
          items.push(...discussions);
        }
      } catch (error) {
        console.error(`Error scraping GitHub topic "${topic}":`, error);
      }
    }

    return items.slice(0, this.config.limit);
  }

  private async searchTrendingRepos(topic: string): Promise<NewsItem[]> {
    try {
      const query = `topic:${topic} created:>2024-01-01 stars:>100 sort:stars-desc`;
      const response = await axios.get(`${this.API_BASE}/search/repositories`, {
        params: { q: query },
        headers: this.SEARCH_HEADERS
      });

      return response.data.items.map((repo: any) => ({
        id: `github-repo-${repo.id}`,
        title: `${repo.full_name}: ${repo.description || 'No description'}`,
        description: repo.description || '',
        source: 'GitHub',
        url: repo.html_url,
        author: repo.owner?.login,
        timestamp: new Date(repo.created_at).getTime(),
        category: this.categorizeRepo(repo),
        score: repo.stargazers_count,
        imageUrl: repo.owner?.avatar_url
      }));
    } catch (error) {
      console.error(`Error searching trending repos for topic "${topic}":`, error);
      return [];
    }
  }

  private async searchRecentIssues(topic: string): Promise<NewsItem[]> {
    try {
      const query = `topic:${topic} is:issue created:>2024-01-01 sort:created-desc`;
      const response = await axios.get(`${this.API_BASE}/search/issues`, {
        params: { q: query },
        headers: this.SEARCH_HEADERS
      });

      return response.data.items.map((issue: any) => ({
        id: `github-issue-${issue.id}`,
        title: `${issue.repository.full_name}: ${issue.title}`,
        description: issue.body || '',
        source: 'GitHub Issues',
        url: issue.html_url,
        author: issue.user?.login,
        timestamp: new Date(issue.created_at).getTime(),
        category: 'API',
        score: issue.reactions?.total_count || 0
      }));
    } catch (error) {
      console.error(`Error searching issues for topic "${topic}":`, error);
      return [];
    }
  }

  private async searchDiscussions(topic: string): Promise<NewsItem[]> {
    // GitHub API doesn't directly support discussions search
    // This would typically use GraphQL or web scraping
    return [];
  }

  private categorizeRepo(repo: any): NewsItem['category'] {
    const topics = repo.topics || [];
    const description = (repo.description || '').toLowerCase();
    
    if (topics.includes('api')) return 'API';
    if (topics.includes('machine-learning') || topics.includes('ai') || topics.includes('llm')) {
      return 'Models';
    }
    if (topics.includes('tutorial') || topics.includes('guide') || description.includes('how to')) {
      return 'How-To';
    }
    
    return 'General';
  }
}

export function createGitHubScraper(config: GitHubScraperConfig): GitHubScraper {
  return new GitHubScraper(config);
}
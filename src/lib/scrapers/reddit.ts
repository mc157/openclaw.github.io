import axios from 'axios';
import { NewsItem, ScrapedData } from '../types';

export interface RedditScraperConfig {
  subreddits: string[];
  limit: number;
  timeFilter: 'day' | 'week' | 'month' | 'year' | 'all';
}

export class RedditScraper {
  private config: RedditScraperConfig;

  constructor(config: RedditScraperConfig) {
    this.config = config;
  }

  async scrape(): Promise<NewsItem[]> {
    const items: NewsItem[] = [];
    
    for (const subreddit of this.config.subreddits) {
      try {
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json`, {
          params: {
            limit: this.config.limit,
            t: this.config.timeFilter
          },
          headers: {
            'User-Agent': 'OpenClaw-NewsHub/1.0.0'
          }
        });

        const posts = response.data.data?.children || [];
        
        for (const post of posts) {
          const postData = post.data;
          
          if (postData.is_self || postData.title) {
            const item: NewsItem = {
              id: `reddit-${subreddit}-${postData.id}`,
              title: postData.title,
              content: postData.selftext || postData.url || '',
              source: `r/${subreddit}`,
              url: `https://reddit.com${postData.permalink}`,
              author: postData.author,
              timestamp: postData.created_utc * 1000,
              category: this.categorizePost(postData),
              score: postData.score,
              imageUrl: postData.url_overridden_by_dest || undefined
            };
            
            items.push(item);
          }
        }
      } catch (error) {
        console.error(`Error scraping Reddit r/${subreddit}:`, error);
      }
    }

    return items;
  }

  private categorizePost(post: any): NewsItem['category'] {
    const title = post.title?.toLowerCase() || '';
    const content = (post.selftext || '').toLowerCase() || '';
    
    const keywords = {
      'API': ['api', 'endpoint', 'rest', 'graphql', 'http'],
      'Models': ['model', 'ai', 'ml', 'machine learning', 'llm', 'gpt', 'claude'],
      'How-To': ['how to', 'tutorial', 'guide', 'step by step', 'how-to'],
      'General': ['news', 'update', 'release', 'announcement']
    };

    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => title.includes(term) || content.includes(term))) {
        return category as NewsItem['category'];
      }
    }

    return 'General';
  }
}

export function createRedditScraper(config: RedditScraperConfig): RedditScraper {
  return new RedditScraper(config);
}
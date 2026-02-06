export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  author?: string;
  timestamp: number;
  category: 
    | 'ClawBot' 
    | 'API' 
    | 'Models' 
    | 'How-To' 
    | 'General';
  score: number;
  imageUrl?: string;
}

export interface ScrapedData {
  reddit?: any[];
  moltbook?: any[];
  github?: any[];
  general?: any[];
}

export interface AggregatedNews {
  items: NewsItem[];
  lastUpdated: number;
  totalSources: number;
}
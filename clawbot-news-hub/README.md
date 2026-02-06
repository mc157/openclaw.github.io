# ClawBot News Hub

A comprehensive news scraping infrastructure built with Next.js that aggregates news from multiple sources including Reddit, GitHub, and tech blogs.

## Features

### 🕷️ Multi-Source Scraping
- **Reddit**: Scrape posts from multiple subreddits (r/programming, r/technology, r/webdev, r/machinelearning, r/LocalLLaMA, r/AI)
- **GitHub**: Fetch trending repositories, issues, and discussions
- **Tech Blogs**: RSS/JSON feed aggregation from TechCrunch, Hacker News, Dev.to, and more

### 📊 Real-Time Data Collection
- Automatic scheduling with configurable intervals
- Persistent data storage with JSON database
- Real-time API endpoints for live updates
- Backup and data cleanup management

### 🔌 API Endpoints
- `/api/news` - Get news items with filtering and pagination
- `/api/sources` - Get source-specific data
- `/api/stats` - Get statistics and analytics
- `/api/realtime` - WebSocket-like real-time updates

### 🛠️ Scripts & Automation
- `npm run scrape` - Manual scraping of all sources
- `npm run schedule` - Automated scheduled scraping
- `npm run git-push` - Automated git commits for data changes

## Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
npm start
```

## API Usage

### Get News Items

```bash
# Get all news
GET /api/news

# Get news by category
GET /api/news?category=API

# Get paginated results
GET /api/news?limit=10&offset=0

# Force refresh data
GET /api/news?refresh=true
```

### Get Source Data

```bash
# Get data from all sources
GET /api/sources
```

### Get Statistics

```bash
# Get aggregated statistics
GET /api/stats
```

### Real-Time Updates

```bash
# Establish real-time connection
GET /api/realtime?pollInterval=30000

# Trigger manual refresh
POST /api/realtime
{
  "action": "refresh"
}
```

## Configuration

### Scraping Configuration

Edit the scraper configurations in `src/lib/aggregator.ts`:

```typescript
// Reddit configuration
const redditScraper = createRedditScraper({
  subreddits: ['programming', 'technology', 'webdev', 'machinelearning'],
  limit: 15,
  timeFilter: 'day' // 'day' | 'week' | 'month' | 'year' | 'all'
});

// GitHub configuration
const githubScraper = createGitHubScraper({
  topics: ['api', 'machine-learning', 'javascript', 'python'],
  limit: 20,
  includeIssues: true,
  includeDiscussions: false
});

// Tech blogs configuration
const techBlogScraper = createTechBlogScraper({
  feeds: [
    {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/feed/',
      type: 'rss',
      category: 'General'
    }
  ],
  maxItemsPerFeed: 8
});
```

### Database Configuration

Database settings are in `src/lib/database.ts`:

```typescript
export const newsDatabase = new NewsDatabase({
  dataDirectory: path.join(process.cwd(), 'data'),
  backupInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxBackups: 7
});
```

## Scheduling

The scheduler runs automatically with different intervals for each source:

- **Reddit**: Every 30 minutes
- **GitHub**: Every 15 minutes
- **Tech Blogs**: Every hour
- **Aggregation**: Every 10 minutes

To run the scheduler:

```bash
npm run schedule
```

## Data Storage

Data is stored in JSON format with automatic backups:

```
data/
├── news-data.json           # Current database
├── backups/                 # Backup files
│   ├── news-data-2024-01-01T10-00-00-000Z.json
│   ├── news-data-2024-01-01T09-00-00-000Z.json
│   └── ...
```

## Categories

News items are automatically categorized:

- **API**: API-related content, endpoints, REST, GraphQL
- **Models**: AI/ML models, machine learning, LLMs
- **How-To**: Tutorials, guides, walkthroughs
- **ClawBot**: OpenClaw and ClawBot-specific content
- **General**: General tech news and announcements

## Error Handling

The system includes comprehensive error handling:

- Retry mechanisms for failed scrapes
- Graceful degradation when sources are unavailable
- Logging and monitoring of scraping activities
- Automatic cleanup of old data

## Development

### Adding New Sources

1. Create a new scraper in `src/lib/scrapers/`
2. Implement the `scrape()` method
3. Add the scraper to the aggregator
4. Update the configuration

### Database Schema

```typescript
interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  author?: string;
  timestamp: number;
  category: 'ClawBot' | 'API' | 'Models' | 'How-To' | 'General';
  score: number;
  imageUrl?: string;
}
```

## Environment Variables

```bash
NODE_ENV=development
# Add any API keys or secrets here if needed
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run scrape` - Run manual scraping
- `npm run schedule` - Start automatic scheduling
- `npm run git-push` - Commit and push data changes
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the OpenClaw ecosystem.
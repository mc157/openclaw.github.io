#!/bin/bash

echo "🚀 Setting up ClawBot News Hub..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Create data directory
mkdir -p data

echo "✅ Data directory created"

# Check if environment file exists
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cat > .env.local << EOF
# News Scraper Configuration
SCRAPING_INTERVAL=15
RATE_LIMIT=2000
MAX_NEWS_ITEMS=1000
RETENTION_DAYS=30

# Optional: Add your API keys if needed
# REDDIT_CLIENT_ID=your_reddit_client_id
# GITHUB_TOKEN=your_github_token
EOF
    echo "✅ Environment file created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Quick start commands:"
echo "  npm run dev          # Start development server"
echo "  npm run build        # Build for production"
echo "  npm run start        # Start production server"
echo "  npm run scrape       # Run scrapers once"
echo "  npm run schedule     # Start scheduled scraping"
echo ""
echo "API Endpoints:"
echo "  GET  /api/news       # Fetch news"
echo "  POST /api/scrape     # Manual scrape"
echo "  GET  /api/scrape/status  # Check scraper status"
echo ""
echo "Open your browser to http://localhost:3000 to see the news hub!"
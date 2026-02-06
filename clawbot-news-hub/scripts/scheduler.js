#!/usr/bin/env node

/**
 * Scheduler script for automatic news scraping
 * Usage: npm run schedule
 */

const path = require('path');

// Set up environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Configuration
const SCHEDULE_CONFIG = {
  // Schedule intervals (in milliseconds)
  intervals: {
    reddit: 30 * 60 * 1000,      // 30 minutes
    github: 15 * 60 * 1000,      // 15 minutes  
    techBlogs: 60 * 60 * 1000,   // 1 hour
    aggregation: 10 * 60 * 1000  // 10 minutes
  },
  // Maximum concurrent requests
  maxConcurrent: 3,
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 5000
  }
};

let scrapingInProgress = false;
let lastScrapeTimes = {
  reddit: 0,
  github: 0,
  techBlogs: 0,
  aggregation: 0
};

console.log('🕒 Starting news scheduler...\n');

async function scrapeWithRetry(fn, name) {
  for (let attempt = 1; attempt <= SCHEDULE_CONFIG.retry.maxAttempts; attempt++) {
    try {
      console.log(`🔄 ${name} (attempt ${attempt}/${SCHEDULE_CONFIG.retry.maxAttempts})...`);
      const result = await fn();
      console.log(`✅ ${name} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ ${name} failed (attempt ${attempt}):`, error.message);
      if (attempt < SCHEDULE_CONFIG.retry.maxAttempts) {
        console.log(`⏳ Retrying in ${SCHEDULE_CONFIG.retry.delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, SCHEDULE_CONFIG.retry.delay));
      }
    }
  }
  throw new Error(`❌ ${name} failed after ${SCHEDULE_CONFIG.retry.maxAttempts} attempts`);
}

async function scheduleScraping() {
  if (scrapingInProgress) {
    console.log('⚠️  Scraping already in progress, skipping...');
    return;
  }

  scrapingInProgress = true;
  const startTime = Date.now();

  try {
    console.log('🚀 Starting scheduled scraping cycle...\n');

    // Reddit scraping
    if (Date.now() - lastScrapeTimes.reddit > SCHEDULE_CONFIG.intervals.reddit) {
      console.log('📡 Scraping Reddit...');
      const { scrapeSources } = await import('../src/lib/aggregator.ts');
      await scrapeWithRetry(() => scrapeSources(), 'Reddit scraping');
      lastScrapeTimes.reddit = Date.now();
    }

    // GitHub scraping  
    if (Date.now() - lastScrapeTimes.github > SCHEDULE_CONFIG.intervals.github) {
      console.log('🐙 Scraping GitHub...');
      const { scrapeSources } = await import('../src/lib/aggregator.ts');
      await scrapeWithRetry(() => scrapeSources(), 'GitHub scraping');
      lastScrapeTimes.github = Date.now();
    }

    // Tech blogs scraping
    if (Date.now() - lastScrapeTimes.techBlogs > SCHEDULE_CONFIG.intervals.techBlogs) {
      console.log('📰 Scraping tech blogs...');
      const { scrapeSources } = await import('../src/lib/aggregator.ts');
      await scrapeWithRetry(() => scrapeSources(), 'Tech blogs scraping');
      lastScrapeTimes.techBlogs = Date.now();
    }

    // Data aggregation
    if (Date.now() - lastScrapeTimes.aggregation > SCHEDULE_CONFIG.intervals.aggregation) {
      console.log('📊 Aggregating data...');
      const { aggregateData } = await import('../src/lib/aggregator.ts');
      const aggregated = await aggregateData();
      console.log(`✅ Aggregated ${aggregated.items.length} items from ${aggregated.totalSources} sources`);
      lastScrapeTimes.aggregation = Date.now();
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Scheduled cycle completed in ${duration / 1000}s\n`);

  } catch (error) {
    console.error('\n❌ Error in scheduled scraping:', error);
  } finally {
    scrapingInProgress = false;
  }
}

// Schedule the scraping jobs
setInterval(scheduleScraping, 5 * 60 * 1000); // Check every 5 minutes

// Initial scrape
setTimeout(scheduleScraping, 5000); // Wait 5 seconds before first run

console.log('📅 Scheduler started. Next run in ~5 minutes.');
console.log('💡 Press Ctrl+C to stop the scheduler\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping scheduler...');
  process.exit(0);
});
#!/usr/bin/env node

/**
 * Manual scraper runner
 * Run with: npm run scrape
 */

const path = require('path');

// Set up path for data directory
process.env.DATA_DIR = path.join(__dirname, '..', 'data');

// Import modules
const { scrapeSources } = require('../dist/lib/aggregator.js');
const { db } = require('../dist/lib/database.js');

console.log('='.repeat(60));
console.log('ClawBot News Hub - Manual Scraper Runner');
console.log('='.repeat(60));

async function runScraping() {
  try {
    console.log(`Starting manual scraping session at ${new Date().toISOString()}`);
    
    // Initialize database
    await db.initialize();
    console.log('✓ Database initialized');
    
    // Run scraping
    const newItems = await scrapeSources();
    
    console.log('');
    console.log('Scraping Results:');
    console.log('-'.repeat(40));
    console.log(`New items found: ${newItems.length}`);
    
    if (newItems.length > 0) {
      console.log('\nRecent items:');
      newItems.slice(0, 5).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Source: ${item.source} | Category: ${item.category}`);
        console.log(`   Score: ${item.score} | Time: ${new Date(item.timestamp).toLocaleString()}`);
        console.log('');
      });
      
      if (newItems.length > 5) {
        console.log(`... and ${newItems.length - 5} more items`);
      }
    } else {
      console.log('No new items found. This might be normal if data is up to date.');
    }
    
    console.log('='.repeat(60));
    console.log('Manual scraping completed successfully!');
    
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1);
  }
}

runScraping();
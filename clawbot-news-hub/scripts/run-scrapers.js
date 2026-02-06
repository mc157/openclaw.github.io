#!/usr/bin/env node

/**
 * Script to run all news scrapers and collect data
 * Usage: npm run scrape
 */

const path = require('path');

// Set up environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

async function runScrapers() {
  console.log('🕷️  Starting news scraping process...\n');
  
  try {
    // Import the aggregator functions
    const { scrapeSources, aggregateData } = await import('../src/lib/aggregator.ts');
    
    console.log('📡 Scraping sources...');
    const scrapedData = await scrapeSources();
    
    console.log('\n📊 Aggregating data...');
    const aggregatedData = await aggregateData();
    
    // Display results
    console.log('\n✅ Scraping completed successfully!\n');
    console.log('📈 Results:');
    console.log(`  - Reddit posts: ${scrapedData.reddit?.length || 0}`);
    console.log(`  - GitHub items: ${scrapedData.github?.length || 0}`);
    console.log(`  - Tech blog items: ${scrapedData.general?.length || 0}`);
    console.log(`  - Total items: ${aggregatedData.items.length}`);
    console.log(`  - Sources: ${aggregatedData.totalSources}`);
    console.log(`  - Last updated: ${new Date(aggregatedData.lastUpdated).toLocaleString()}`);
    
    // Display category breakdown
    const categories = {};
    aggregatedData.items.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    console.log('\n📋 Category breakdown:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} items`);
    });
    
    console.log('\n🎉 All done!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run the scrapers
runScrapers();
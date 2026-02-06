#!/usr/bin/env node

/**
 * Standalone scheduler for news scraping
 * Run with: npm run schedule
 */

const path = require('path');

// Set up path for data directory
process.env.DATA_DIR = path.join(__dirname, '..', 'data');

// Import modules (will be compiled TypeScript)
const { scraperManager } = require('../dist/lib/scraper-manager.js');
const { db } = require('../dist/lib/database.js');

console.log('='.repeat(60));
console.log('ClawBot News Hub - Scheduled Scraper');
console.log('='.repeat(60));
console.log(`Started at: ${new Date().toISOString()}`);
console.log(`Data directory: ${process.env.DATA_DIR}`);
console.log('');

// Initialize database
async function initialize() {
  try {
    await db.initialize();
    console.log('✓ Database initialized');
    
    // Start scheduled scraping every 15 minutes
    scraperManager.startScheduling(15);
    console.log('✓ Scheduled scraping started (every 15 minutes)');
    console.log('');
    console.log('Press Ctrl+C to stop...');
    
  } catch (error) {
    console.error('Failed to initialize:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down scheduler...');
  scraperManager.stopScheduling();
  console.log('Scheduler stopped. Goodbye!');
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  scraperManager.stopScheduling();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the scheduler
initialize();

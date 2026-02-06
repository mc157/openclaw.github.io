#!/usr/bin/env node

/**
 * Git automation script for scraped data
 * Automatically commits and pushes data changes
 * Usage: npm run git-push
 */

const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');

const execAsync = util.promisify(exec);

async function runGitPush() {
  console.log('🚀 Starting git automation...\n');

  try {
    // Check if we're in a git repository
    try {
      await execAsync('git status');
      console.log('✅ Git repository detected');
    } catch (error) {
      console.log('❌ Not a git repository');
      process.exit(1);
    }

    // Get current git status
    const { stdout: status } = await execAsync('git status --porcelain');
    
    if (!status.trim()) {
      console.log('📭 No changes to commit');
      process.exit(0);
    }

    console.log('📋 Changed files:');
    status.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`  ${line}`);
      }
    });

    // Add changes
    console.log('\n📦 Adding changes...');
    await execAsync('git add .');

    // Commit changes
    const commitMessage = `chore: Update scraped news data - ${new Date().toISOString()}`;
    console.log(`💾 Committing with message: "${commitMessage}"`);
    await execAsync(`git commit -m "${commitMessage}"`);

    // Push changes
    console.log('🚀 Pushing to remote...');
    await execAsync('git push origin main');

    console.log('\n✅ Git automation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error in git automation:', error.message);
    process.exit(1);
  }
}

// Run the git automation
runGitPush();
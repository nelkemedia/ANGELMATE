#!/usr/bin/env node
import { execSync } from 'child_process';

async function initDatabase() {
  try {
    console.log('🗄️  Syncing database schema...');

    // Use db push with accept-data-loss to handle schema conflicts
    // This is safer than migrate deploy when the DB is in an inconsistent state
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      env: { ...process.env }
    });

    console.log('✅ Database synchronized successfully');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase().then(() => {
  console.log('🚀 Starting server...');
  // Start the server as a child process
  execSync('node src/server.js', { stdio: 'inherit' });
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

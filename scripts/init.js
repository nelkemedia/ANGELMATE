#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🗄️  Checking database migrations...');

    // Try to check if _prisma_migrations table exists and has entries
    const migrations = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "_prisma_migrations"
    `;

    console.log(`✅ Found ${migrations[0].count} completed migrations`);

    // If table exists, proceed with normal migration
    console.log('🔄 Running pending migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  } catch (error) {
    // If table doesn't exist (P3005), we need to baseline
    if (error.message.includes('does not exist') || error.code === 'P3005') {
      console.log('⚠️  Database not initialized with Prisma. Baselining...');

      try {
        // Mark the existing schema as baseline by resolving old migrations
        console.log('📋 Marking previous migrations as resolved...');
        execSync('npx prisma migrate resolve --rolled-back 20260424052210_add_avatar', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260424043323_add_comments_likes', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260424045110_add_weekly_vote', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260424060525_add_report', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260424063919_add_admin_role', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260427000001_add_email_templates', { stdio: 'ignore' });
        execSync('npx prisma migrate resolve --rolled-back 20260428094102_add_ads_and_advertisers', { stdio: 'ignore' });

        console.log('🔄 Now running all migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (retryError) {
        console.error('❌ Migration recovery failed:', retryError.message);
        process.exit(1);
      }
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase().then(() => {
  console.log('✅ Database initialized successfully');
  console.log('🚀 Starting server...');
  // Start the server as a child process
  execSync('node src/server.js', { stdio: 'inherit' });
}).catch(error => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});

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
      console.log('⚠️  Database not initialized with Prisma. Creating baseline...');

      try {
        // Create and populate the _prisma_migrations table manually
        console.log('📋 Initializing Prisma migrations table...');

        // First, create the migrations table if it doesn't exist
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
            id VARCHAR(36) PRIMARY KEY,
            checksum VARCHAR(64) NOT NULL,
            finished_at TIMESTAMP,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            logs TEXT,
            rolled_back_at TIMESTAMP,
            started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            execution_time BIGINT NOT NULL
          )
        `);

        const migrationsList = [
          '20260423140545_init',
          '20260424043323_add_comments_likes',
          '20260424045110_add_weekly_vote',
          '20260424052210_add_avatar',
          '20260424060525_add_report',
          '20260424063919_add_admin_role',
          '20260427000001_add_email_templates',
          '20260428094102_add_ads_and_advertisers',
        ];

        for (const migration of migrationsList) {
          const migrationId = `${migration}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          try {
            await prisma.$executeRaw`
              INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, execution_time)
              VALUES (
                ${migrationId},
                ${'checksum-' + migration},
                NOW(),
                ${migration},
                '',
                NULL,
                NOW(),
                0
              )
            `;
          } catch (e) {
            // Ignore duplicate key errors
            if (!e.message.includes('duplicate')) throw e;
          }
        }

        console.log('✅ Baseline created');
        console.log('🔄 Now running pending migrations...');
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

#!/bin/sh
set -e

echo "🗄️  Initializing database..."

# Try to run migrations
if npx prisma migrate deploy; then
    echo "✅ Migrations deployed successfully"
else
    MIGRATE_EXIT=$?

    # If P3005 (schema not empty), resolve the baseline
    if [ $MIGRATE_EXIT -ne 0 ]; then
        echo "⚠️  Migration failed, attempting baseline recovery..."
        npx prisma migrate resolve --rolled-back 20260428094102_add_ads_and_advertisers || true
        npx prisma migrate deploy || true
    fi
fi

echo "🚀 Starting server..."
node src/server.js

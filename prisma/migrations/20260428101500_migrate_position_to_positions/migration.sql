-- Drop the old position column if it still exists
ALTER TABLE "Ad" DROP COLUMN IF EXISTS "position";

-- If the old DASHBOARD value exists in AdPosition enum, we need to drop and recreate the enum
-- First, we'll create a new type with only the valid values
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'AdPosition'
      AND EXISTS (
        SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AdPosition')
        AND enumlabel = 'DASHBOARD'
      )
  ) THEN
    -- Remove DASHBOARD value from enum if it exists
    ALTER TYPE "AdPosition" RENAME TO "AdPosition_old";
    CREATE TYPE "AdPosition" AS ENUM ('FEED', 'DASHBOARD_TOP', 'DASHBOARD_BOTTOM');
    ALTER TABLE "Ad" ALTER COLUMN "positions" TYPE "AdPosition"[] USING "positions"::text::"AdPosition"[];
    DROP TYPE "AdPosition_old";
  END IF;
END $$;

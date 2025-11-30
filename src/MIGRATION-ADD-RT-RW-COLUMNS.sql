-- ============================================
-- ADD RT/RW COLUMNS TO TABLES (MISSING COLUMNS FIX)
-- ============================================
-- This migration adds RT/RW columns to tables that are missing them
-- Required for proper RT/RW filtering in SikasRT system
-- ============================================

-- ============================================
-- 1. ADD RT/RW TO WASTE_DEPOSITS TABLE
-- ============================================

-- Add columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waste_deposits' AND column_name = 'rt'
    ) THEN
        ALTER TABLE waste_deposits ADD COLUMN rt TEXT NOT NULL DEFAULT '001';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waste_deposits' AND column_name = 'rw'
    ) THEN
        ALTER TABLE waste_deposits ADD COLUMN rw TEXT NOT NULL DEFAULT '001';
    END IF;
END $$;

-- Remove defaults after adding columns
ALTER TABLE waste_deposits ALTER COLUMN rt DROP DEFAULT;
ALTER TABLE waste_deposits ALTER COLUMN rw DROP DEFAULT;

-- Update existing rows to get RT/RW from their resident profile
UPDATE waste_deposits wd
SET 
  rt = rp.rt,
  rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND (wd.rt = '001' OR wd.rw = '001');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);

-- ============================================
-- 2. UPDATE RLS POLICIES FOR WASTE_DEPOSITS
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Residents can view their own deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can view all deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can insert deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Resident can read own waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admin can read waste deposits in same RT/RW" ON waste_deposits;
DROP POLICY IF EXISTS "Service role full access waste_deposits" ON waste_deposits;

-- Create new policies with proper RT/RW filtering

-- Policy: Residents can view their own deposits
CREATE POLICY "Residents can view their own deposits"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

-- Policy: Admins can view deposits in their RT/RW
CREATE POLICY "Admins can view deposits in their RT/RW"
  ON waste_deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

-- Policy: Admins can insert deposits in their RT/RW
CREATE POLICY "Admins can insert deposits in their RT/RW"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

-- Policy: Admins can update deposits in their RT/RW
CREATE POLICY "Admins can update deposits in their RT/RW"
  ON waste_deposits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

-- Policy: Admins can delete deposits in their RT/RW
CREATE POLICY "Admins can delete deposits in their RT/RW"
  ON waste_deposits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

-- ============================================
-- 3. CHECK OTHER TABLES FOR RT/RW COLUMNS
-- ============================================

-- Add RT/RW to trash_schedules if missing
DO $$ 
BEGIN
    -- Check if table exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'trash_schedules'
    ) THEN
        -- Add rt column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'trash_schedules' AND column_name = 'rt'
        ) THEN
            ALTER TABLE trash_schedules ADD COLUMN rt TEXT NOT NULL DEFAULT '001';
            ALTER TABLE trash_schedules ALTER COLUMN rt DROP DEFAULT;
        END IF;

        -- Add rw column if missing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'trash_schedules' AND column_name = 'rw'
        ) THEN
            ALTER TABLE trash_schedules ADD COLUMN rw TEXT NOT NULL DEFAULT '001';
            ALTER TABLE trash_schedules ALTER COLUMN rw DROP DEFAULT;
        END IF;

        -- Create index
        CREATE INDEX IF NOT EXISTS idx_trash_schedules_rt_rw ON trash_schedules(rt, rw);
    END IF;
END $$;

-- Add RT/RW to schedules if missing
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'schedules'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'rt'
        ) THEN
            ALTER TABLE schedules ADD COLUMN rt TEXT NOT NULL DEFAULT '001';
            ALTER TABLE schedules ALTER COLUMN rt DROP DEFAULT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedules' AND column_name = 'rw'
        ) THEN
            ALTER TABLE schedules ADD COLUMN rw TEXT NOT NULL DEFAULT '001';
            ALTER TABLE schedules ALTER COLUMN rw DROP DEFAULT;
        END IF;

        CREATE INDEX IF NOT EXISTS idx_schedules_rt_rw ON schedules(rt, rw);
    END IF;
END $$;

-- ============================================
-- 4. CREATE/UPDATE WASTE BANK SUMMARY VIEW
-- ============================================

-- Drop and recreate view with RT/RW columns
DROP VIEW IF EXISTS waste_bank_summary;

CREATE OR REPLACE VIEW waste_bank_summary AS
SELECT 
  wd.rt,
  wd.rw,
  wd.waste_type,
  COUNT(*) as deposit_count,
  SUM(wd.weight) as total_weight,
  SUM(wd.total_value) as total_value,
  AVG(wd.weight) as avg_weight,
  AVG(wd.total_value) as avg_value
FROM waste_deposits wd
GROUP BY wd.rt, wd.rw, wd.waste_type;

-- Grant access to view
GRANT SELECT ON waste_bank_summary TO authenticated;
GRANT SELECT ON waste_bank_summary TO service_role;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- To verify the changes, run these queries:

-- Check waste_deposits structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'waste_deposits'
-- ORDER BY ordinal_position;

-- Check if RT/RW columns exist and have data
-- SELECT rt, rw, COUNT(*) as count
-- FROM waste_deposits
-- GROUP BY rt, rw;

-- Check policies
-- SELECT policyname FROM pg_policies WHERE tablename = 'waste_deposits';

-- Test view
-- SELECT * FROM waste_bank_summary LIMIT 5;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Run this entire script in Supabase SQL Editor
-- Expected result: "Success. No rows returned"
-- ============================================

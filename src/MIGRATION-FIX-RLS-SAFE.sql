-- ============================================
-- SAFE MIGRATION - FIX RLS POLICIES
-- ============================================
-- This migration checks existing columns before altering
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add rt, rw to fees table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fees' AND column_name='rt') THEN
    ALTER TABLE fees ADD COLUMN rt TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fees' AND column_name='rw') THEN
    ALTER TABLE fees ADD COLUMN rw TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='fees' AND column_name='created_by') THEN
    ALTER TABLE fees ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add rt, rw to waste_deposits table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='waste_deposits' AND column_name='rt') THEN
    ALTER TABLE waste_deposits ADD COLUMN rt TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='waste_deposits' AND column_name='rw') THEN
    ALTER TABLE waste_deposits ADD COLUMN rw TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='waste_deposits' AND column_name='created_by') THEN
    ALTER TABLE waste_deposits ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create pickup_schedules table if not exists
CREATE TABLE IF NOT EXISTS pickup_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_fees_rt_rw ON fees(rt, rw);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_rt_rw ON pickup_schedules(rt, rw);

-- ============================================
-- 4. DROP OLD RLS POLICIES
-- ============================================

-- Admin profiles
DROP POLICY IF EXISTS "Admin can read own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admin can update own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Service role full access admin_profiles" ON admin_profiles;

-- Resident profiles
DROP POLICY IF EXISTS "Resident can read own profile" ON resident_profiles;
DROP POLICY IF EXISTS "Resident can update own profile" ON resident_profiles;
DROP POLICY IF EXISTS "Admin can read residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Service role full access resident_profiles" ON resident_profiles;

-- Fees
DROP POLICY IF EXISTS "Residents can read own fees" ON fees;
DROP POLICY IF EXISTS "Admins can read fees in same RT/RW" ON fees;
DROP POLICY IF EXISTS "Admins can create fees" ON fees;
DROP POLICY IF EXISTS "Admins can update fees" ON fees;
DROP POLICY IF EXISTS "Admins can delete fees" ON fees;
DROP POLICY IF EXISTS "Admins can create fees in same RT/RW" ON fees;
DROP POLICY IF EXISTS "Admins can update fees in same RT/RW" ON fees;
DROP POLICY IF EXISTS "Admins can delete fees in same RT/RW" ON fees;

-- Waste deposits
DROP POLICY IF EXISTS "Residents can read own waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can read waste deposits in same RT/RW" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can create waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can update waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can delete waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can create waste deposits in same RT/RW" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can update waste deposits in same RT/RW" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can delete waste deposits in same RT/RW" ON waste_deposits;

-- Pickup schedules
DROP POLICY IF EXISTS "Users can read schedules in same RT/RW" ON pickup_schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON pickup_schedules;
DROP POLICY IF EXISTS "Admins can create schedules in same RT/RW" ON pickup_schedules;
DROP POLICY IF EXISTS "Admins can update schedules in same RT/RW" ON pickup_schedules;
DROP POLICY IF EXISTS "Admins can delete schedules in same RT/RW" ON pickup_schedules;

-- ============================================
-- 5. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_schedules ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. CREATE NEW SIMPLIFIED RLS POLICIES
-- ============================================

-- 6.1 ADMIN PROFILES
-- Users can manage their own admin profile
CREATE POLICY "admin_select_own"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "admin_insert_own"
  ON admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_update_own"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6.2 RESIDENT PROFILES
-- Users can manage their own resident profile
CREATE POLICY "resident_select_own"
  ON resident_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "resident_insert_own"
  ON resident_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "resident_update_own"
  ON resident_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view residents in same RT/RW
CREATE POLICY "admin_select_residents"
  ON resident_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = resident_profiles.rt
      AND ap.rw = resident_profiles.rw
    )
  );

-- Admins can manage residents in same RT/RW
CREATE POLICY "admin_insert_residents"
  ON resident_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = resident_profiles.rt
      AND ap.rw = resident_profiles.rw
    )
  );

CREATE POLICY "admin_update_residents"
  ON resident_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = resident_profiles.rt
      AND ap.rw = resident_profiles.rw
    )
  );

CREATE POLICY "admin_delete_residents"
  ON resident_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = resident_profiles.rt
      AND ap.rw = resident_profiles.rw
    )
  );

-- 6.3 FEES
-- Residents can view their own fees
CREATE POLICY "fees_select_own"
  ON fees FOR SELECT
  USING (resident_id = auth.uid());

-- Residents can update their own fees (for payment proof upload)
CREATE POLICY "fees_update_own"
  ON fees FOR UPDATE
  USING (resident_id = auth.uid());

-- Admins can view fees in same RT/RW
CREATE POLICY "fees_select_admin"
  ON fees FOR SELECT
  USING (
    fees.rt IS NOT NULL AND fees.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = fees.rt
      AND ap.rw = fees.rw
    )
  );

-- Admins can manage fees in same RT/RW
CREATE POLICY "fees_insert_admin"
  ON fees FOR INSERT
  WITH CHECK (
    fees.rt IS NOT NULL AND fees.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = fees.rt
      AND ap.rw = fees.rw
    )
  );

CREATE POLICY "fees_update_admin"
  ON fees FOR UPDATE
  USING (
    fees.rt IS NOT NULL AND fees.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = fees.rt
      AND ap.rw = fees.rw
    )
  );

CREATE POLICY "fees_delete_admin"
  ON fees FOR DELETE
  USING (
    fees.rt IS NOT NULL AND fees.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = fees.rt
      AND ap.rw = fees.rw
    )
  );

-- 6.4 WASTE DEPOSITS
-- Residents can view their own waste deposits
CREATE POLICY "waste_select_own"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

-- Admins can view waste deposits in same RT/RW
CREATE POLICY "waste_select_admin"
  ON waste_deposits FOR SELECT
  USING (
    waste_deposits.rt IS NOT NULL AND waste_deposits.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = waste_deposits.rt
      AND ap.rw = waste_deposits.rw
    )
  );

-- Admins can manage waste deposits in same RT/RW
CREATE POLICY "waste_insert_admin"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    waste_deposits.rt IS NOT NULL AND waste_deposits.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = waste_deposits.rt
      AND ap.rw = waste_deposits.rw
    )
  );

CREATE POLICY "waste_update_admin"
  ON waste_deposits FOR UPDATE
  USING (
    waste_deposits.rt IS NOT NULL AND waste_deposits.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = waste_deposits.rt
      AND ap.rw = waste_deposits.rw
    )
  );

CREATE POLICY "waste_delete_admin"
  ON waste_deposits FOR DELETE
  USING (
    waste_deposits.rt IS NOT NULL AND waste_deposits.rw IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = waste_deposits.rt
      AND ap.rw = waste_deposits.rw
    )
  );

-- 6.5 PICKUP SCHEDULES
-- Everyone in same RT/RW can view schedules
CREATE POLICY "schedule_select_all"
  ON pickup_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = pickup_schedules.rt
      AND ap.rw = pickup_schedules.rw
    )
    OR
    EXISTS (
      SELECT 1 FROM resident_profiles rp
      WHERE rp.id = auth.uid()
      AND rp.rt = pickup_schedules.rt
      AND rp.rw = pickup_schedules.rw
    )
  );

-- Only admins can manage schedules
CREATE POLICY "schedule_insert_admin"
  ON pickup_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = pickup_schedules.rt
      AND ap.rw = pickup_schedules.rw
    )
  );

CREATE POLICY "schedule_update_admin"
  ON pickup_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = pickup_schedules.rt
      AND ap.rw = pickup_schedules.rw
    )
  );

CREATE POLICY "schedule_delete_admin"
  ON pickup_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.rt = pickup_schedules.rt
      AND ap.rw = pickup_schedules.rw
    )
  );

-- ============================================
-- 7. UPDATE EXISTING DATA WITH RT/RW
-- ============================================

-- Update fees with RT/RW from resident profiles
UPDATE fees f
SET rt = rp.rt, rw = rp.rw
FROM resident_profiles rp
WHERE f.resident_id = rp.id
AND f.rt IS NULL;

-- Update waste_deposits with RT/RW from resident profiles
UPDATE waste_deposits wd
SET rt = rp.rt, rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND wd.rt IS NULL;

-- ============================================
-- MIGRATION COMPLETED SUCCESSFULLY!
-- ============================================

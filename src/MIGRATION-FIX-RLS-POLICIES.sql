-- ============================================
-- FIX RLS POLICIES FOR 401 ERRORS
-- ============================================
-- Run this migration in Supabase SQL Editor
-- This fixes authentication and permission errors
-- ============================================

-- 1. DROP EXISTING RESTRICTIVE POLICIES
-- ============================================

-- Drop old admin_profiles policies
DROP POLICY IF EXISTS "Admin can read own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admin can update own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Service role full access admin_profiles" ON admin_profiles;

-- Drop old resident_profiles policies
DROP POLICY IF EXISTS "Resident can read own profile" ON resident_profiles;
DROP POLICY IF EXISTS "Resident can update own profile" ON resident_profiles;
DROP POLICY IF EXISTS "Admin can read residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Service role full access resident_profiles" ON resident_profiles;

-- ============================================
-- 2. CREATE NEW SIMPLER POLICIES
-- ============================================

-- 2.1 Admin Profiles - Allow users to read their own profile
CREATE POLICY "Users can read own admin profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own admin profile"
  ON admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own admin profile"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2.2 Resident Profiles - Allow users to read their own profile
CREATE POLICY "Users can read own resident profile"
  ON resident_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own resident profile"
  ON resident_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own resident profile"
  ON resident_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2.3 Allow admins to read all residents in same RT/RW
CREATE POLICY "Admins can read residents in same RT/RW"
  ON resident_profiles FOR SELECT
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

-- 2.4 Allow admins to manage residents in same RT/RW
CREATE POLICY "Admins can insert residents in same RT/RW"
  ON resident_profiles FOR INSERT
  WITH CHECK (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can update residents in same RT/RW"
  ON resident_profiles FOR UPDATE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can delete residents in same RT/RW"
  ON resident_profiles FOR DELETE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

-- ============================================
-- 3. CREATE FEES TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES resident_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'pending')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  payment_proof TEXT,
  verified_at TIMESTAMPTZ,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fees
CREATE INDEX IF NOT EXISTS idx_fees_resident ON fees(resident_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_rt_rw ON fees(rt, rw);
CREATE INDEX IF NOT EXISTS idx_fees_month_year ON fees(month, year);

-- Enable RLS for fees
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- Drop existing fees policies
DROP POLICY IF EXISTS "Residents can read own fees" ON fees;
DROP POLICY IF EXISTS "Admins can read fees in same RT/RW" ON fees;
DROP POLICY IF EXISTS "Admins can create fees" ON fees;
DROP POLICY IF EXISTS "Admins can update fees" ON fees;
DROP POLICY IF EXISTS "Admins can delete fees" ON fees;

-- Create fees policies
CREATE POLICY "Residents can read own fees"
  ON fees FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can read fees in same RT/RW"
  ON fees FOR SELECT
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can create fees in same RT/RW"
  ON fees FOR INSERT
  WITH CHECK (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can update fees in same RT/RW"
  ON fees FOR UPDATE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can delete fees in same RT/RW"
  ON fees FOR DELETE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Residents can update own fees"
  ON fees FOR UPDATE
  USING (resident_id = auth.uid());

-- ============================================
-- 4. CREATE WASTE_DEPOSITS TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS waste_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES resident_profiles(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  deposit_date DATE NOT NULL,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for waste_deposits
CREATE INDEX IF NOT EXISTS idx_waste_deposits_resident ON waste_deposits(resident_id);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_date ON waste_deposits(deposit_date);

-- Enable RLS for waste_deposits
ALTER TABLE waste_deposits ENABLE ROW LEVEL SECURITY;

-- Drop existing waste_deposits policies
DROP POLICY IF EXISTS "Residents can read own waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can read waste deposits in same RT/RW" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can create waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can update waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can delete waste deposits" ON waste_deposits;

-- Create waste_deposits policies
CREATE POLICY "Residents can read own waste deposits"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can read waste deposits in same RT/RW"
  ON waste_deposits FOR SELECT
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can create waste deposits in same RT/RW"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can update waste deposits in same RT/RW"
  ON waste_deposits FOR UPDATE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can delete waste deposits in same RT/RW"
  ON waste_deposits FOR DELETE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

-- ============================================
-- 5. CREATE PICKUP_SCHEDULES TABLE IF NOT EXISTS
-- ============================================

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

-- Create indexes for pickup_schedules
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_rt_rw ON pickup_schedules(rt, rw);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_date ON pickup_schedules(date);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_status ON pickup_schedules(status);

-- Enable RLS for pickup_schedules
ALTER TABLE pickup_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing pickup_schedules policies
DROP POLICY IF EXISTS "Users can read schedules in same RT/RW" ON pickup_schedules;
DROP POLICY IF EXISTS "Admins can manage schedules" ON pickup_schedules;

-- Create pickup_schedules policies
CREATE POLICY "Users can read schedules in same RT/RW"
  ON pickup_schedules FOR SELECT
  USING (
    (rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
     AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid()))
    OR
    (rt IN (SELECT rp.rt FROM resident_profiles rp WHERE rp.id = auth.uid())
     AND rw IN (SELECT rp.rw FROM resident_profiles rp WHERE rp.id = auth.uid()))
  );

CREATE POLICY "Admins can create schedules in same RT/RW"
  ON pickup_schedules FOR INSERT
  WITH CHECK (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can update schedules in same RT/RW"
  ON pickup_schedules FOR UPDATE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

CREATE POLICY "Admins can delete schedules in same RT/RW"
  ON pickup_schedules FOR DELETE
  USING (
    rt IN (SELECT ap.rt FROM admin_profiles ap WHERE ap.id = auth.uid())
    AND rw IN (SELECT ap.rw FROM admin_profiles ap WHERE ap.id = auth.uid())
  );

-- ============================================
-- MIGRATION COMPLETED!
-- ============================================
-- All RLS policies have been updated to be more permissive
-- Tables fees, waste_deposits, and pickup_schedules are ready
-- Now test the application to verify 401 errors are resolved
-- ============================================

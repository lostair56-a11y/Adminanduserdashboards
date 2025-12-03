-- ============================================
-- FIX SEMUA RLS POLICIES UNTUK SIKASRT
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- untuk memperbaiki SEMUA permission pada tabel-tabel penting
--
-- Tabel yang akan diperbaiki:
-- 1. resident_profiles
-- 2. fee_payments
-- 3. pickup_schedules

-- ═══════════════════════════════════════════
-- 1. RESIDENT_PROFILES TABLE
-- ═══════════════════════════════════════════

-- Drop semua policy existing
DROP POLICY IF EXISTS "Admin can update residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can update residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Allow admin to update residents" ON resident_profiles;
DROP POLICY IF EXISTS "Admin can delete residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can delete residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Allow admin to delete residents" ON resident_profiles;
DROP POLICY IF EXISTS "Admin can view residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can view residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Residents can view own profile" ON resident_profiles;
DROP POLICY IF EXISTS "Admin can insert residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can insert residents in their RT/RW" ON resident_profiles;

-- SELECT: Admin bisa lihat resident di RT/RW yang sama
CREATE POLICY "Admin can view residents in same RT/RW"
ON resident_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
  OR
  auth.uid() = id -- Resident bisa lihat profil sendiri
);

-- INSERT: Admin bisa tambah resident di RT/RW yang sama
CREATE POLICY "Admin can insert residents in same RT/RW"
ON resident_profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
);

-- UPDATE: Admin bisa update resident di RT/RW yang sama
CREATE POLICY "Admin can update residents in same RT/RW"
ON resident_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
);

-- DELETE: Admin bisa delete resident di RT/RW yang sama
CREATE POLICY "Admin can delete residents in same RT/RW"
ON resident_profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
);

-- ═══════════════════════════════════════════
-- 2. FEE_PAYMENTS TABLE
-- ═══════════════════════════════════════════

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage fee payments in same RT/RW" ON fee_payments;
DROP POLICY IF EXISTS "Admins can view fee payments in their RT/RW" ON fee_payments;
DROP POLICY IF EXISTS "Residents can view own payments" ON fee_payments;

-- SELECT: Admin & Resident bisa lihat
CREATE POLICY "Admin and residents can view fee payments"
ON fee_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resident_profiles rp
    JOIN admin_profiles ap ON ap.rt = rp.rt AND ap.rw = rp.rw
    WHERE fee_payments.resident_id = rp.id
    AND (ap.id = auth.uid() OR rp.id = auth.uid())
  )
);

-- INSERT: Admin & Resident bisa tambah
CREATE POLICY "Admin and residents can insert fee payments"
ON fee_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM resident_profiles rp
    JOIN admin_profiles ap ON ap.rt = rp.rt AND ap.rw = rp.rw
    WHERE fee_payments.resident_id = rp.id
    AND (ap.id = auth.uid() OR rp.id = auth.uid())
  )
);

-- UPDATE: Hanya Admin yang bisa update (approve/reject)
CREATE POLICY "Admin can update fee payments in same RT/RW"
ON fee_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM resident_profiles rp
    JOIN admin_profiles ap ON ap.rt = rp.rt AND ap.rw = rp.rw
    WHERE fee_payments.resident_id = rp.id
    AND ap.id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM resident_profiles rp
    JOIN admin_profiles ap ON ap.rt = rp.rt AND ap.rw = rp.rw
    WHERE fee_payments.resident_id = rp.id
    AND ap.id = auth.uid()
  )
);

-- DELETE: Hanya Admin yang bisa delete
CREATE POLICY "Admin can delete fee payments in same RT/RW"
ON fee_payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM resident_profiles rp
    JOIN admin_profiles ap ON ap.rt = rp.rt AND ap.rw = rp.rw
    WHERE fee_payments.resident_id = rp.id
    AND ap.id = auth.uid()
  )
);

-- ═══════════════════════════════════════════
-- 3. PICKUP_SCHEDULES TABLE
-- ═══════════════════════════════════════════

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage schedules in same RT/RW" ON pickup_schedules;
DROP POLICY IF EXISTS "Residents can view schedules in their RT/RW" ON pickup_schedules;

-- SELECT: Admin & Resident bisa lihat
CREATE POLICY "Admin and residents can view schedules"
ON pickup_schedules
FOR SELECT
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

-- INSERT: Hanya Admin yang bisa tambah
CREATE POLICY "Admin can insert schedules in same RT/RW"
ON pickup_schedules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid()
    AND ap.rt = pickup_schedules.rt
    AND ap.rw = pickup_schedules.rw
  )
);

-- UPDATE: Hanya Admin yang bisa update
CREATE POLICY "Admin can update schedules in same RT/RW"
ON pickup_schedules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid()
    AND ap.rt = pickup_schedules.rt
    AND ap.rw = pickup_schedules.rw
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid()
    AND ap.rt = pickup_schedules.rt
    AND ap.rw = pickup_schedules.rw
  )
);

-- DELETE: Hanya Admin yang bisa delete
CREATE POLICY "Admin can delete schedules in same RT/RW"
ON pickup_schedules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid()
    AND ap.rt = pickup_schedules.rt
    AND ap.rw = pickup_schedules.rw
  )
);

-- ═══════════════════════════════════════════
-- 4. ENABLE RLS PADA SEMUA TABEL
-- ═══════════════════════════════════════════

ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_schedules ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════
-- 5. VERIFIKASI SEMUA POLICIES
-- ═══════════════════════════════════════════

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN roles = '{public}' THEN 'authenticated users'
    ELSE roles::text
  END as allowed_roles
FROM pg_policies
WHERE tablename IN (
  'resident_profiles',
  'admin_profiles', 
  'fee_payments',
  'pickup_schedules'
)
ORDER BY tablename, cmd, policyname;

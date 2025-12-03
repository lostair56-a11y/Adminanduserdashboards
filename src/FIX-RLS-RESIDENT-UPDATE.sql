-- ============================================
-- FIX RLS POLICY FOR RESIDENT UPDATE & DELETE
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- untuk memperbaiki permission UPDATE dan DELETE pada resident_profiles

-- 1. Drop existing UPDATE policy jika ada
DROP POLICY IF EXISTS "Admin can update residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can update residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Allow admin to update residents" ON resident_profiles;

-- 2. Drop existing DELETE policy jika ada
DROP POLICY IF EXISTS "Admin can delete residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can delete residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Allow admin to delete residents" ON resident_profiles;

-- 3. Create new UPDATE policy
-- Admin bisa update resident yang RT/RW nya sama
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

-- 4. Create new DELETE policy
-- Admin bisa delete resident yang RT/RW nya sama
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

-- 5. Pastikan RLS enabled
ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Verifikasi policy yang aktif
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'resident_profiles'
ORDER BY policyname;

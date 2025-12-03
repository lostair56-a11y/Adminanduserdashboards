-- ============================================
-- FIX RLS POLICY FOR RESIDENT UPDATE
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- untuk memperbaiki permission UPDATE pada resident_profiles

-- 1. Drop existing UPDATE policy jika ada
DROP POLICY IF EXISTS "Admin can update residents in same RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Admins can update residents in their RT/RW" ON resident_profiles;
DROP POLICY IF EXISTS "Allow admin to update residents" ON resident_profiles;

-- 2. Create new UPDATE policy yang lebih permisif
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

-- 3. Pastikan RLS enabled
ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verifikasi policy yang aktif
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'resident_profiles'
ORDER BY policyname;

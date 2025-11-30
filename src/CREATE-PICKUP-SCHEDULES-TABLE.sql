-- ============================================
-- CREATE PICKUP_SCHEDULES TABLE
-- ============================================
-- Table untuk jadwal pengangkutan sampah per RT/RW
-- Run this SQL in Supabase SQL Editor

-- Drop existing table if any (HATI-HATI: ini akan hapus data yang ada)
DROP TABLE IF EXISTS public.pickup_schedules CASCADE;

-- Create pickup_schedules table
CREATE TABLE public.pickup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_pickup_schedules_date ON public.pickup_schedules(date);
CREATE INDEX idx_pickup_schedules_status ON public.pickup_schedules(status);
CREATE INDEX idx_pickup_schedules_rt_rw ON public.pickup_schedules(rt, rw);

-- Enable Row Level Security
ALTER TABLE public.pickup_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone (Admin & Resident) can view schedules in their RT/RW
CREATE POLICY "Everyone can view schedules in their RT/RW"
  ON public.pickup_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
    OR
    EXISTS (
      SELECT 1 FROM resident_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

-- Policy: Only Admins can insert schedules for their RT/RW
CREATE POLICY "Admins can insert schedules for their RT/RW"
  ON public.pickup_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

-- Policy: Only Admins can update schedules for their RT/RW
CREATE POLICY "Admins can update schedules for their RT/RW"
  ON public.pickup_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

-- Policy: Only Admins can delete schedules for their RT/RW
CREATE POLICY "Admins can delete schedules for their RT/RW"
  ON public.pickup_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_schedules TO authenticated;

-- Verification Query (optional - untuk cek hasilnya)
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'pickup_schedules') as column_count
FROM information_schema.tables 
WHERE table_name = 'pickup_schedules';

-- Expected result:
-- table_name          | column_count
-- -------------------|-------------
-- pickup_schedules   | 9

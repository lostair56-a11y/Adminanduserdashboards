-- ============================================
-- CLEAN MIGRATION - NO MARKDOWN SYNTAX
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Check if fees table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'fees'
    ) THEN
        -- Create fees table
        CREATE TABLE public.fees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE NOT NULL,
          amount INTEGER NOT NULL,
          description TEXT NOT NULL,
          due_date DATE NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'unpaid')),
          payment_method TEXT,
          payment_date TIMESTAMPTZ,
          payment_proof TEXT,
          rt TEXT NOT NULL,
          rw TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_fees_resident_id ON public.fees(resident_id);
        CREATE INDEX idx_fees_status ON public.fees(status);
        CREATE INDEX idx_fees_rt_rw ON public.fees(rt, rw);
        CREATE INDEX idx_fees_due_date ON public.fees(due_date);

        -- Enable RLS
        ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Residents can view their own fees"
          ON public.fees FOR SELECT
          USING (resident_id = auth.uid());

        CREATE POLICY "Admins can view fees in their RT/RW"
          ON public.fees FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = fees.rt 
              AND rw = fees.rw
            )
          );

        CREATE POLICY "Admins can insert fees in their RT/RW"
          ON public.fees FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = fees.rt 
              AND rw = fees.rw
            )
          );

        CREATE POLICY "Admins can update fees in their RT/RW"
          ON public.fees FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = fees.rt 
              AND rw = fees.rw
            )
          );

        CREATE POLICY "Admins can delete fees in their RT/RW"
          ON public.fees FOR DELETE
          USING (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = fees.rt 
              AND rw = fees.rw
            )
          );

        CREATE POLICY "Residents can update their own fees"
          ON public.fees FOR UPDATE
          USING (resident_id = auth.uid())
          WITH CHECK (resident_id = auth.uid());

        -- Grant permissions
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;

        RAISE NOTICE 'Table fees created successfully';
    ELSE
        RAISE NOTICE 'Table fees already exists';
    END IF;
END $$;

-- Check if pickup_schedules table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'pickup_schedules'
    ) THEN
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

        -- Create indexes
        CREATE INDEX idx_pickup_schedules_date ON public.pickup_schedules(date);
        CREATE INDEX idx_pickup_schedules_status ON public.pickup_schedules(status);
        CREATE INDEX idx_pickup_schedules_rt_rw ON public.pickup_schedules(rt, rw);

        -- Enable RLS
        ALTER TABLE public.pickup_schedules ENABLE ROW LEVEL SECURITY;

        -- Create policies
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

        CREATE POLICY "Admins can insert schedules for their RT/RW"
          ON public.pickup_schedules FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = pickup_schedules.rt 
              AND rw = pickup_schedules.rw
            )
          );

        CREATE POLICY "Admins can update schedules in their RT/RW"
          ON public.pickup_schedules FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM admin_profiles 
              WHERE id = auth.uid() 
              AND rt = pickup_schedules.rt 
              AND rw = pickup_schedules.rw
            )
          );

        CREATE POLICY "Admins can delete schedules in their RT/RW"
          ON public.pickup_schedules FOR DELETE
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

        RAISE NOTICE 'Table pickup_schedules created successfully';
    ELSE
        RAISE NOTICE 'Table pickup_schedules already exists';
    END IF;
END $$;

-- Add RT/RW columns to waste_deposits if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waste_deposits' AND column_name = 'rt'
    ) THEN
        ALTER TABLE waste_deposits ADD COLUMN rt TEXT;
        RAISE NOTICE 'Column rt added to waste_deposits';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'waste_deposits' AND column_name = 'rw'
    ) THEN
        ALTER TABLE waste_deposits ADD COLUMN rw TEXT;
        RAISE NOTICE 'Column rw added to waste_deposits';
    END IF;
END $$;

-- Update waste_deposits RT/RW from resident profiles
UPDATE waste_deposits wd
SET 
  rt = rp.rt,
  rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND (wd.rt IS NULL OR wd.rw IS NULL);

-- Create index for waste_deposits
CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);

-- Verification
SELECT 
  'fees' as table_name,
  COUNT(*) as exists
FROM information_schema.tables 
WHERE table_name = 'fees'
UNION ALL
SELECT 
  'pickup_schedules' as table_name,
  COUNT(*) as exists
FROM information_schema.tables 
WHERE table_name = 'pickup_schedules';

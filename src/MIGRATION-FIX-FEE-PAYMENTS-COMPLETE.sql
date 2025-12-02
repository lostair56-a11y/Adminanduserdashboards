-- ============================================
-- MIGRATION: Fix fee_payments Table Structure
-- ============================================
-- This migration adds missing columns to fee_payments table
-- Safe to run multiple times (idempotent)
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE 'Starting migration for fee_payments table...';
  
  -- ============================================
  -- 1. Add payment_proof column
  -- ============================================
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE '✅ Column payment_proof added successfully';
  ELSE
    RAISE NOTICE '⏭️  Column payment_proof already exists';
  END IF;

  -- ============================================
  -- 2. Add due_date column (if needed)
  -- ============================================
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'due_date'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN due_date DATE;
    RAISE NOTICE '✅ Column due_date added successfully';
  ELSE
    RAISE NOTICE '⏭️  Column due_date already exists';
  END IF;

  -- ============================================
  -- 3. Add verified_at column (if needed)
  -- ============================================
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN verified_at TIMESTAMPTZ;
    RAISE NOTICE '✅ Column verified_at added successfully';
  ELSE
    RAISE NOTICE '⏭️  Column verified_at already exists';
  END IF;

  RAISE NOTICE 'Migration completed successfully! 🎉';
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Check all columns in fee_payments table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'fee_payments'
ORDER BY ordinal_position;

-- ============================================
-- EXPECTED COLUMNS
-- ============================================
-- The fee_payments table should now have:
-- - id (uuid)
-- - resident_id (uuid)
-- - amount (numeric)
-- - month (text)
-- - year (integer)
-- - status (text)
-- - description (text)
-- - payment_date (timestamp with time zone)
-- - payment_method (text)
-- - payment_proof (text) ← ADDED
-- - due_date (date) ← ADDED
-- - verified_at (timestamp with time zone) ← ADDED
-- - rt (text)
-- - rw (text)
-- - created_at (timestamp with time zone)
-- - updated_at (timestamp with time zone)
-- ============================================

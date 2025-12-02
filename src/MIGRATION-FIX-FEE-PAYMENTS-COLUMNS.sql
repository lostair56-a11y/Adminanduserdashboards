-- Migration: Fix fee_payments table structure
-- Add missing columns: payment_proof and due_date
-- This migration is safe to run multiple times

DO $$ 
BEGIN
  -- Add payment_proof column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE 'Column payment_proof added to fee_payments table';
  ELSE
    RAISE NOTICE 'Column payment_proof already exists in fee_payments table';
  END IF;

  -- Add due_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'due_date'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN due_date DATE;
    RAISE NOTICE 'Column due_date added to fee_payments table';
  ELSE
    RAISE NOTICE 'Column due_date already exists in fee_payments table';
  END IF;
END $$;

-- Update existing records with NULL due_date to set a default
-- Set due_date to last day of the month/year specified
UPDATE fee_payments
SET due_date = (
  DATE(year || '-' || 
    CASE month
      WHEN 'Januari' THEN '01'
      WHEN 'Februari' THEN '02'
      WHEN 'Maret' THEN '03'
      WHEN 'April' THEN '04'
      WHEN 'Mei' THEN '05'
      WHEN 'Juni' THEN '06'
      WHEN 'Juli' THEN '07'
      WHEN 'Agustus' THEN '08'
      WHEN 'September' THEN '09'
      WHEN 'Oktober' THEN '10'
      WHEN 'November' THEN '11'
      WHEN 'Desember' THEN '12'
      ELSE '01'
    END || '-01') + INTERVAL '1 month' - INTERVAL '1 day'
)::DATE
WHERE due_date IS NULL;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fee_payments'
ORDER BY ordinal_position;

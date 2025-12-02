-- Migration: Add due_date column to fee_payments table if not exists
-- This migration is safe to run multiple times

-- Add due_date column if it doesn't exist
DO $$ 
BEGIN
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
  COUNT(*) as total_records,
  COUNT(due_date) as records_with_due_date
FROM fee_payments;

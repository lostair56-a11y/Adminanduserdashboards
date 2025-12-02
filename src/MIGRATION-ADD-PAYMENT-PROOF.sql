-- Migration: Add payment_proof column to fee_payments table if not exists
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
END $$;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fee_payments'
AND column_name = 'payment_proof';

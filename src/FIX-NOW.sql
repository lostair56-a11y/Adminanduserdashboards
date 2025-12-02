-- ============================================
-- QUICK FIX: payment_proof Column Error
-- ============================================
-- Copy paste SQL ini ke Supabase SQL Editor
-- Klik RUN, tunggu selesai, refresh aplikasi
-- ============================================

-- Add payment_proof column (safe to run multiple times)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE '✅ Column payment_proof added successfully!';
  ELSE
    RAISE NOTICE '⏭️  Column payment_proof already exists - no action needed';
  END IF;
END $$;

-- Verify the result
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fee_payments'
AND column_name = 'payment_proof';

-- ============================================
-- Expected Output:
-- payment_proof | text | YES
-- ============================================

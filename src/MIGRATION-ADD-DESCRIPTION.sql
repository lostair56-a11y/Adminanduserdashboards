-- Migration: Add description column to fee_payments table
-- Date: 2025-11-16
-- Description: This migration adds the description column to the fee_payments table for bill details

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'fee_payments' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE fee_payments ADD COLUMN description TEXT;
        RAISE NOTICE 'Column description added to fee_payments table';
    ELSE
        RAISE NOTICE 'Column description already exists in fee_payments table';
    END IF;
END $$;

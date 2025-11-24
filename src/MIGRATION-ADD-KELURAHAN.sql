-- Migration: Add kelurahan, kecamatan, kota columns to admin_profiles table
-- Date: 2025-11-19
-- Description: This migration adds location columns to admin_profiles table to match resident_profiles structure

-- Add kelurahan column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_profiles' 
        AND column_name = 'kelurahan'
    ) THEN
        ALTER TABLE admin_profiles ADD COLUMN kelurahan TEXT DEFAULT 'N/A';
        RAISE NOTICE 'Column kelurahan added to admin_profiles table';
    ELSE
        RAISE NOTICE 'Column kelurahan already exists in admin_profiles table';
    END IF;
END $$;

-- Add kecamatan column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_profiles' 
        AND column_name = 'kecamatan'
    ) THEN
        ALTER TABLE admin_profiles ADD COLUMN kecamatan TEXT DEFAULT 'N/A';
        RAISE NOTICE 'Column kecamatan added to admin_profiles table';
    ELSE
        RAISE NOTICE 'Column kecamatan already exists in admin_profiles table';
    END IF;
END $$;

-- Add kota column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'admin_profiles' 
        AND column_name = 'kota'
    ) THEN
        ALTER TABLE admin_profiles ADD COLUMN kota TEXT DEFAULT 'N/A';
        RAISE NOTICE 'Column kota added to admin_profiles table';
    ELSE
        RAISE NOTICE 'Column kota already exists in admin_profiles table';
    END IF;
END $$;

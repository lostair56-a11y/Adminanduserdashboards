-- ========================================
-- FIX DOUBLE BALANCE BUG
-- ========================================
-- Problem: Saldo bank sampah ditambahkan 2x lipat
-- Cause: Trigger kemungkinan ter-create duplikat atau ada manual update
-- Solution: Drop & recreate trigger yang proper, hapus manual update di backend
-- ========================================

-- 1. Drop existing triggers (jika ada duplikat)
DROP TRIGGER IF EXISTS after_waste_deposit ON waste_deposits;
DROP TRIGGER IF EXISTS after_waste_deposit_insert ON waste_deposits;
DROP TRIGGER IF EXISTS after_waste_deposit_update ON waste_deposits;
DROP TRIGGER IF EXISTS after_waste_deposit_delete ON waste_deposits;

-- 2. Drop existing functions
DROP FUNCTION IF EXISTS update_waste_bank_balance() CASCADE;
DROP FUNCTION IF EXISTS update_waste_bank_balance_on_insert() CASCADE;
DROP FUNCTION IF EXISTS update_waste_bank_balance_on_update() CASCADE;
DROP FUNCTION IF EXISTS update_waste_bank_balance_on_delete() CASCADE;

-- 3. Add rt and rw columns to waste_deposits if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waste_deposits' AND column_name = 'rt'
  ) THEN
    ALTER TABLE waste_deposits ADD COLUMN rt TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'waste_deposits' AND column_name = 'rw'
  ) THEN
    ALTER TABLE waste_deposits ADD COLUMN rw TEXT;
  END IF;
END $$;

-- 4. Create comprehensive trigger function for INSERT
CREATE OR REPLACE FUNCTION handle_waste_deposit_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balance by adding the deposit value
  UPDATE resident_profiles
  SET waste_bank_balance = waste_bank_balance + NEW.total_value
  WHERE id = NEW.resident_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create comprehensive trigger function for UPDATE
CREATE OR REPLACE FUNCTION handle_waste_deposit_update()
RETURNS TRIGGER AS $$
DECLARE
  balance_diff INTEGER;
BEGIN
  -- Calculate the difference between new and old total_value
  balance_diff := NEW.total_value - OLD.total_value;
  
  -- Update balance by adding the difference
  UPDATE resident_profiles
  SET waste_bank_balance = waste_bank_balance + balance_diff
  WHERE id = NEW.resident_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create comprehensive trigger function for DELETE
CREATE OR REPLACE FUNCTION handle_waste_deposit_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balance by subtracting the deleted deposit value
  UPDATE resident_profiles
  SET waste_bank_balance = waste_bank_balance - OLD.total_value
  WHERE id = OLD.resident_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for INSERT, UPDATE, and DELETE
CREATE TRIGGER after_waste_deposit_insert
  AFTER INSERT ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION handle_waste_deposit_insert();

CREATE TRIGGER after_waste_deposit_update
  AFTER UPDATE ON waste_deposits
  FOR EACH ROW
  WHEN (OLD.total_value IS DISTINCT FROM NEW.total_value OR OLD.resident_id IS DISTINCT FROM NEW.resident_id)
  EXECUTE FUNCTION handle_waste_deposit_update();

CREATE TRIGGER after_waste_deposit_delete
  AFTER DELETE ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION handle_waste_deposit_delete();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify the fix:

-- 1. Check if triggers exist (should show 3 triggers)
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'waste_deposits';

-- 2. Check if functions exist (should show 3 functions)
-- SELECT routine_name 
-- FROM information_schema.routines 
-- WHERE routine_name LIKE 'handle_waste_deposit%';

-- 3. Test the triggers with a sample insert
-- INSERT INTO waste_deposits (resident_id, waste_type, weight, price_per_kg, total_value, date, rt, rw)
-- SELECT id, 'Test Plastik', 1, 3000, 3000, CURRENT_DATE, rt, rw
-- FROM resident_profiles LIMIT 1;

-- 4. Check the balance after insert (should increase by exactly 3000)
-- SELECT name, waste_bank_balance FROM resident_profiles WHERE id = (SELECT resident_id FROM waste_deposits ORDER BY created_at DESC LIMIT 1);

-- 5. Delete the test record
-- DELETE FROM waste_deposits WHERE waste_type = 'Test Plastik';

-- ========================================
-- NEXT STEPS
-- ========================================
-- 1. Run this migration SQL in Supabase SQL Editor
-- 2. Update backend code to remove manual balance updates in updateWasteDeposit function
-- 3. Test with real data: input 3000, should add exactly 3000 to balance

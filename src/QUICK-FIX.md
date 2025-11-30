# ⚡ QUICK FIX - Copy & Paste Ready

## 🎯 2 SQL Queries - Run in Order

Go to: **https://supabase.com → SQL Editor**

---

## 1️⃣ CREATE FEES TABLE (Run First)

```sql
-- ============================================
-- CREATE FEES TABLE (FIXED VERSION)
-- ============================================

DROP TABLE IF EXISTS public.fees CASCADE;

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

CREATE INDEX idx_fees_resident_id ON public.fees(resident_id);
CREATE INDEX idx_fees_status ON public.fees(status);
CREATE INDEX idx_fees_rt_rw ON public.fees(rt, rw);
CREATE INDEX idx_fees_due_date ON public.fees(due_date);
CREATE INDEX idx_fees_payment_date ON public.fees(payment_date);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE FUNCTION update_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fees_updated_at
  BEFORE UPDATE ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION update_fees_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO service_role;
```

✅ **Expected Result:** "Success. No rows returned"

---

## 2️⃣ ADD RT/RW TO WASTE_DEPOSITS (Run Second)

```sql
-- ============================================
-- ADD RT/RW COLUMNS TO WASTE_DEPOSITS
-- ============================================

ALTER TABLE waste_deposits ADD COLUMN IF NOT EXISTS rt TEXT NOT NULL DEFAULT '001';
ALTER TABLE waste_deposits ADD COLUMN IF NOT EXISTS rw TEXT NOT NULL DEFAULT '001';

ALTER TABLE waste_deposits ALTER COLUMN rt DROP DEFAULT;
ALTER TABLE waste_deposits ALTER COLUMN rw DROP DEFAULT;

UPDATE waste_deposits wd
SET 
  rt = rp.rt,
  rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND (wd.rt = '001' OR wd.rw = '001');

CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);

DROP POLICY IF EXISTS "Residents can view their own deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can view all deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can insert deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Resident can read own waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admin can read waste deposits in same RT/RW" ON waste_deposits;

CREATE POLICY "Residents can view their own deposits"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can view deposits in their RT/RW"
  ON waste_deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

CREATE POLICY "Admins can insert deposits in their RT/RW"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

CREATE POLICY "Admins can update deposits in their RT/RW"
  ON waste_deposits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

CREATE POLICY "Admins can delete deposits in their RT/RW"
  ON waste_deposits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = waste_deposits.rt 
      AND rw = waste_deposits.rw
    )
  );

DROP VIEW IF EXISTS waste_bank_summary;

CREATE OR REPLACE VIEW waste_bank_summary AS
SELECT 
  wd.rt,
  wd.rw,
  wd.waste_type,
  COUNT(*) as deposit_count,
  SUM(wd.weight) as total_weight,
  SUM(wd.total_value) as total_value,
  AVG(wd.weight) as avg_weight,
  AVG(wd.total_value) as avg_value
FROM waste_deposits wd
GROUP BY wd.rt, wd.rw, wd.waste_type;

GRANT SELECT ON waste_bank_summary TO authenticated;
GRANT SELECT ON waste_bank_summary TO service_role;
```

✅ **Expected Result:** "Success. No rows returned"

---

## ✅ Verify Both Worked

```sql
-- Check fees table
SELECT COUNT(*) FROM fees;
-- Should return: 0

-- Check waste_deposits has RT/RW
SELECT rt, rw, COUNT(*) FROM waste_deposits GROUP BY rt, rw;
-- Should show your RT/RW data

-- Check policies
SELECT tablename, COUNT(*) FROM pg_policies 
WHERE tablename IN ('fees', 'waste_deposits')
GROUP BY tablename;
-- fees: 6 policies
-- waste_deposits: 5 policies
```

---

## 🎯 DONE!

Database errors fixed! 

**Next:** Configure Vercel (see `/ACTION-NOW.md` Error #3)

---

**Total time:** 5 minutes
**Result:** Database fully functional

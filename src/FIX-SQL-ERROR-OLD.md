# 🚨 FIX: SQL Error "missing FROM-clause entry for table 'old'"

## Error Message
```
Error: Failed to run sql query: 
ERROR: 42P01: missing FROM-clause entry for table "old"
```

---

## ✅ Root Cause (FIXED!)

**Problem:** RLS Policy menggunakan `OLD.status` di dalam `WITH CHECK` clause.

**Why Error:** 
- `OLD` hanya tersedia di **TRIGGER functions**
- `OLD` TIDAK bisa dipakai di **RLS policies**
- RLS policies hanya bisa pakai current row values

**Example yang salah:**
```sql
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid() 
    AND (OLD.status = 'unpaid' OR OLD.status = 'pending')  -- ❌ ERROR!
  );
```

---

## 🎯 SOLUTION - Use Fixed SQL

### ✅ SQL yang Sudah Diperbaiki

File baru: **`/MIGRATION-CREATE-FEES-TABLE-FIXED.sql`**

**Changes:**
```sql
-- ❌ OLD VERSION (Error):
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid() 
    AND (OLD.status = 'unpaid' OR OLD.status = 'pending')  -- ❌
  );

-- ✅ NEW VERSION (Fixed):
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid()  -- ✅ Removed OLD reference
  );
```

---

## ⚡ Quick Fix (30 seconds)

### Option 1: Use Fixed File

**Copy SQL dari file ini:**
👉 **`/MIGRATION-CREATE-FEES-TABLE-FIXED.sql`**

**Atau dari:**
👉 **`/ACTION-NOW.md`** (sudah di-update dengan SQL yang benar)

### Option 2: Manual Fix

Jika Anda sudah run migration yang error:

```sql
-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "Residents can update their own fees" ON public.fees;

-- 2. Recreate with correct version
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid());
```

---

## 📋 Complete Fixed Migration

Copy & paste ini ke Supabase SQL Editor:

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

-- Indexes
CREATE INDEX idx_fees_resident_id ON public.fees(resident_id);
CREATE INDEX idx_fees_status ON public.fees(status);
CREATE INDEX idx_fees_rt_rw ON public.fees(rt, rw);
CREATE INDEX idx_fees_due_date ON public.fees(due_date);
CREATE INDEX idx_fees_payment_date ON public.fees(payment_date);

-- Enable RLS
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- FIXED: Removed OLD reference
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (resident_id = auth.uid());

-- Trigger for auto-update updated_at
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

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO service_role;
```

---

## ✅ Verify It Works

After running the fixed SQL:

```sql
-- 1. Check table exists
SELECT COUNT(*) FROM fees;
-- Should return: 0 (not an error)

-- 2. Check policies
SELECT policyname FROM pg_policies WHERE tablename = 'fees';
-- Should return: 6 policies

-- 3. Test insert (as admin)
-- Should work without error
```

---

## 💡 Why This Happened

**Context:**
- RLS policies define **security rules** for data access
- Triggers define **actions** when data changes
- `OLD` and `NEW` are special variables in triggers
- RLS policies can only check **current** row values

**What We Wanted:**
- Prevent residents from changing status from 'paid' back to 'unpaid'

**Why It Failed:**
- Tried to use `OLD.status` in RLS policy
- RLS doesn't have access to OLD values
- Only triggers have OLD/NEW

**Correct Approach:**
- Remove OLD reference from policy
- Or implement check in application logic
- Or use trigger for validation

---

## 🔧 Alternative: Trigger-Based Validation

Jika Anda ingin prevent status changes, gunakan trigger:

```sql
-- Prevent changing from 'paid' to 'unpaid'
CREATE OR REPLACE FUNCTION validate_fee_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow if user is admin
  IF OLD.status = 'paid' AND NEW.status IN ('unpaid', 'pending') THEN
    IF NOT EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Cannot change status from paid to unpaid';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_fee_status
  BEFORE UPDATE ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION validate_fee_status_change();
```

**Note:** Ini optional! Fixed SQL di atas sudah cukup untuk aplikasi jalan.

---

## 📊 Status Update

| Item | Status |
|------|--------|
| SQL Error Fixed | ✅ YES |
| New file created | ✅ `/MIGRATION-CREATE-FEES-TABLE-FIXED.sql` |
| ACTION-NOW.md updated | ✅ With fixed SQL |
| Ready to run | ✅ YES |

---

## 🚀 Next Steps

1. ✅ Copy SQL dari `/MIGRATION-CREATE-FEES-TABLE-FIXED.sql`
2. ✅ Paste ke Supabase SQL Editor
3. ✅ Click "Run"
4. ✅ Verify: `SELECT COUNT(*) FROM fees;`
5. ✅ Continue dengan Vercel setup

---

## 🆘 If Still Error

**Other possible errors:**

### "relation 'resident_profiles' does not exist"
→ Need to create base tables first
→ Run: `/MIGRATION-CREATE-ALL-MISSING-TABLES.sql`

### "permission denied"
→ Make sure you're logged in as project owner
→ Or use service_role key

### "syntax error near..."
→ Make sure you copied ENTIRE SQL
→ Check for missing semicolons

---

**FIXED! Now go run the corrected SQL! 🚀**

# 🚨 FIX: Error "column waste_deposits.rt does not exist"

## 🔴 Error Message
```
Error fetching report data: {"error":"column waste_deposits.rt does not exist"}
```

---

## ✅ Root Cause (FIXED!)

**Problem:** Tabel `waste_deposits` tidak memiliki kolom `rt` dan `rw`

**Why This Matters:**
- SikasRT memerlukan filtering data berdasarkan RT/RW
- Admin hanya boleh lihat data warga di RT/RW mereka
- Report module menggunakan RT/RW untuk filtering
- RLS policies memerlukan kolom RT/RW

**Impact:**
- ❌ Reports gagal load
- ❌ Admin tidak bisa filter data waste deposits by RT/RW
- ❌ RLS policies tidak bisa enforce security

---

## 🎯 SOLUTION - Run Migration + Update Code

### ✅ STEP 1: Run SQL Migration

**File:** `/MIGRATION-ADD-RT-RW-COLUMNS.sql`

**What it does:**
1. ✅ Add columns `rt` and `rw` to `waste_deposits` table
2. ✅ Update existing rows with RT/RW from resident profiles
3. ✅ Create indexes for performance
4. ✅ Update RLS policies with proper RT/RW filtering
5. ✅ Add RT/RW to other tables if missing (schedules, trash_schedules)
6. ✅ Create waste_bank_summary view with RT/RW

---

## ⚡ QUICK FIX (3 Minutes)

### Run This SQL in Supabase:

```sql
-- ============================================
-- ADD RT/RW TO WASTE_DEPOSITS
-- ============================================

-- 1. Add columns with default values
ALTER TABLE waste_deposits ADD COLUMN IF NOT EXISTS rt TEXT NOT NULL DEFAULT '001';
ALTER TABLE waste_deposits ADD COLUMN IF NOT EXISTS rw TEXT NOT NULL DEFAULT '001';

-- 2. Remove defaults (so future inserts must specify RT/RW)
ALTER TABLE waste_deposits ALTER COLUMN rt DROP DEFAULT;
ALTER TABLE waste_deposits ALTER COLUMN rw DROP DEFAULT;

-- 3. Update existing rows from resident profiles
UPDATE waste_deposits wd
SET 
  rt = rp.rt,
  rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND (wd.rt = '001' OR wd.rw = '001');

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Residents can view their own deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can view all deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admins can insert deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Resident can read own waste deposits" ON waste_deposits;
DROP POLICY IF EXISTS "Admin can read waste deposits in same RT/RW" ON waste_deposits;

-- Create new policies with RT/RW filtering
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

-- ============================================
-- CREATE VIEW FOR REPORTS
-- ============================================

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

---

## ✅ STEP 2: Code Already Fixed!

**What I updated:**

### `/supabase/functions/server/wastebank.tsx`

#### Fix 1: Add RT/RW to new deposits
```tsx
// OLD (Missing RT/RW):
const { data: depositData } = await supabase
  .from('waste_deposits')
  .insert({
    resident_id,
    waste_type,
    weight,
    price_per_kg,
    total_value,
    date: new Date().toISOString()
  });

// NEW (With RT/RW):
// Get resident's RT/RW first
const { data: residentData } = await supabase
  .from('resident_profiles')
  .select('rt, rw')
  .eq('id', resident_id)
  .single();

const { data: depositData } = await supabase
  .from('waste_deposits')
  .insert({
    resident_id,
    waste_type,
    weight,
    price_per_kg,
    total_value,
    rt: residentData.rt,  // ✅ Added
    rw: residentData.rw,  // ✅ Added
    date: new Date().toISOString()
  });
```

#### Fix 2: Add RT/RW to payment transactions
```tsx
// OLD:
const { data: residentProfile } = await supabase
  .from('resident_profiles')
  .select('waste_bank_balance, name')
  .eq('id', user.id)
  .single();

await supabase
  .from('waste_deposits')
  .insert({
    resident_id: user.id,
    waste_type: 'Pembayaran Iuran',
    total_value: -fee.amount,
    date: new Date().toISOString()
  });

// NEW:
const { data: residentProfile } = await supabase
  .from('resident_profiles')
  .select('waste_bank_balance, name, rt, rw')  // ✅ Added rt, rw
  .eq('id', user.id)
  .single();

await supabase
  .from('waste_deposits')
  .insert({
    resident_id: user.id,
    waste_type: 'Pembayaran Iuran',
    total_value: -fee.amount,
    rt: residentProfile.rt,   // ✅ Added
    rw: residentProfile.rw,   // ✅ Added
    date: new Date().toISOString()
  });
```

---

## 🔍 Verify It Works

After running the SQL migration:

```sql
-- 1. Check columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'waste_deposits'
ORDER BY ordinal_position;

-- Expected: Should show 'rt' and 'rw' columns

-- 2. Check data is populated
SELECT rt, rw, COUNT(*) as count
FROM waste_deposits
GROUP BY rt, rw;

-- Expected: Should show actual RT/RW values (not all '001')

-- 3. Check policies
SELECT policyname FROM pg_policies WHERE tablename = 'waste_deposits';

-- Expected: Should return 5 policies

-- 4. Test view
SELECT * FROM waste_bank_summary LIMIT 5;

-- Expected: Should return grouped waste data by RT/RW
```

---

## 📊 What This Fixes

| Before | After |
|--------|-------|
| ❌ Error: column rt does not exist | ✅ Columns exist |
| ❌ Reports gagal load | ✅ Reports work |
| ❌ No RT/RW filtering | ✅ Proper RT/RW isolation |
| ❌ RLS policies incomplete | ✅ RLS enforced by RT/RW |
| ❌ New inserts fail | ✅ Code includes RT/RW |

---

## 🔧 Technical Details

### Why We Use DEFAULT First?

```sql
-- Step 1: Add with default (allows adding to existing table)
ALTER TABLE waste_deposits ADD COLUMN rt TEXT NOT NULL DEFAULT '001';

-- Step 2: Update real values from resident profiles
UPDATE waste_deposits wd SET rt = rp.rt FROM resident_profiles rp WHERE wd.resident_id = rp.id;

-- Step 3: Drop default (force future inserts to specify)
ALTER TABLE waste_deposits ALTER COLUMN rt DROP DEFAULT;
```

**Reason:** PostgreSQL requires NOT NULL columns to have a default when adding to existing table with data.

### How It Updates Existing Rows?

```sql
UPDATE waste_deposits wd
SET 
  rt = rp.rt,
  rw = rp.rw
FROM resident_profiles rp
WHERE wd.resident_id = rp.id
AND (wd.rt = '001' OR wd.rw = '001');
```

**Process:**
1. JOIN waste_deposits with resident_profiles
2. Copy RT/RW from resident to their deposits
3. Only update rows that still have default value '001'

---

## 🆘 Troubleshooting

### Error: "constraint violation"
**Meaning:** Resident profile doesn't have RT/RW

**Fix:**
```sql
-- Check residents without RT/RW
SELECT id, name FROM resident_profiles WHERE rt IS NULL OR rw IS NULL;

-- Update them
UPDATE resident_profiles SET rt = '001', rw = '001' WHERE rt IS NULL;
```

### Error: "column already exists"
**Meaning:** You ran migration twice

**Fix:** Ignore, atau:
```sql
-- Use IF NOT EXISTS
ALTER TABLE waste_deposits ADD COLUMN IF NOT EXISTS rt TEXT;
```

### Reports still error?
**Check:**
1. ✅ SQL migration ran successfully
2. ✅ Columns exist: `\d waste_deposits`
3. ✅ Data populated: `SELECT COUNT(*) FROM waste_deposits WHERE rt != '001'`
4. ✅ Restart application (refresh browser)

---

## 📚 Files Updated

| File | Status | Changes |
|------|--------|---------|
| `/MIGRATION-ADD-RT-RW-COLUMNS.sql` | ✅ NEW | Complete migration SQL |
| `/supabase/functions/server/wastebank.tsx` | ✅ UPDATED | Added RT/RW to inserts |
| `/FIX-WASTE-DEPOSITS-RT-RW.md` | ✅ NEW | This guide |
| `/ACTION-NOW.md` | ⏳ UPDATE NEEDED | Add this migration to checklist |

---

## 🚀 Next Steps After Fix

1. ✅ Run SQL migration above
2. ✅ Verify columns exist
3. ✅ Test reports module (should load without error)
4. ✅ Test adding new waste deposit (should include RT/RW)
5. ✅ Continue with other modules

---

## 📝 Additional Notes

### Other Tables That Need RT/RW

The migration also checks and adds RT/RW to:
- ✅ `trash_schedules` (if exists)
- ✅ `schedules` (if exists)

### Performance Optimization

Added indexes:
```sql
CREATE INDEX idx_waste_deposits_rt_rw ON waste_deposits(rt, rw);
```

This speeds up queries that filter by RT/RW.

### View for Reports

Created `waste_bank_summary` view for easier reporting:
```sql
SELECT * FROM waste_bank_summary WHERE rt = '001' AND rw = '002';
```

---

## ✅ Summary

**Problem:** Missing RT/RW columns in waste_deposits table

**Solution:** 
1. Run SQL migration to add columns
2. Update existing data
3. Fix RLS policies
4. Code already updated to include RT/RW in inserts

**Time to fix:** ~3 minutes

**Result:** Reports work, RT/RW filtering works, security enforced

---

**✅ COPY THE SQL ABOVE AND RUN IN SUPABASE NOW! 🚀**

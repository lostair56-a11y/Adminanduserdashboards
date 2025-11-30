# ✅ Checklist - Verify All Required Tables

## 🎯 Purpose
Ensure semua tabel yang dibutuhkan SikasRT sudah ada di Supabase database.

---

## 📊 Required Tables (7 Total)

### Core Tables (5)
1. ✅ **admin_profiles** - Data Admin RT
2. ✅ **resident_profiles** - Data Warga
3. ✅ **fees** - Tagihan/Iuran (NEW - often missing!)
4. ✅ **waste_deposits** - Transaksi Bank Sampah
5. ✅ **schedules** - Jadwal Pengangkutan Sampah

### Legacy/Optional Tables (2)
6. ⚠️ **fee_payments** - Old fee system (optional, akan dimigrasi ke `fees`)
7. ⚠️ **notifications** - Notifikasi (optional, might not be used)

---

## 🔍 Quick Check - Run This SQL

### Copy & Paste ke Supabase SQL Editor:

```sql
-- ============================================
-- CHECK ALL TABLES
-- ============================================

-- List all tables in public schema
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'admin_profiles', 
      'resident_profiles', 
      'fees', 
      'waste_deposits', 
      'schedules'
    ) THEN '✅ REQUIRED'
    WHEN table_name IN ('fee_payments', 'notifications') THEN '⚠️ OPTIONAL'
    ELSE '❓ UNKNOWN'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## 📋 Expected Output

Should see:

| table_name | status |
|------------|--------|
| admin_profiles | ✅ REQUIRED |
| fee_payments | ⚠️ OPTIONAL |
| fees | ✅ REQUIRED |
| notifications | ⚠️ OPTIONAL |
| resident_profiles | ✅ REQUIRED |
| schedules | ✅ REQUIRED |
| waste_deposits | ✅ REQUIRED |

---

## ❌ If Missing Tables

### Missing: `fees` ← MOST COMMON!

**Error you'll see:**
```
Error: Could not find the table 'public.fees' in the schema cache
```

**Fix:**
👉 Read: `/FIX-FEES-TABLE-NOW.md`
👉 Run: `/MIGRATION-CREATE-FEES-TABLE.sql`

---

### Missing: `resident_profiles` or `admin_profiles`

**Error you'll see:**
```
Error: relation "resident_profiles" does not exist
Error: Could not find the table 'public.admin_profiles'
```

**Fix:**
👉 Run: `/MIGRATION-CREATE-ALL-MISSING-TABLES.sql`
👉 Or run: `/supabase-schema.sql` (complete setup)

---

### Missing: `waste_deposits`

**Error you'll see:**
```
Error: Could not find the table 'public.waste_deposits'
```

**Fix:**
Run this SQL:
```sql
CREATE TABLE waste_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_kg INTEGER NOT NULL,
  total_value INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waste_deposits ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own deposits"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can view all deposits"
  ON waste_deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert deposits"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON waste_deposits TO authenticated;
```

---

### Missing: `schedules`

**Error you'll see:**
```
Error: Could not find the table 'public.schedules'
```

**Fix:**
Run this SQL:
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed')),
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Everyone can view schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON schedules TO authenticated;
```

---

## 🔧 Check Table Structure

For each table, verify columns are correct:

### Check `fees` Table Structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'fees'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid)
- resident_id (uuid)
- amount (integer)
- description (text)
- due_date (date)
- status (text)
- payment_method (text)
- payment_date (timestamp with time zone)
- payment_proof (text)
- rt (text)
- rw (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)

---

## 🔒 Check RLS Policies

Verify Row Level Security policies are set:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected for `fees` table:**
- ✅ 6 policies total
- Residents can view/update their own
- Admins can view/insert/update/delete in their RT/RW

---

## 📊 Check Table Relationships

Verify foreign keys:

```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Expected relationships:**
- fees.resident_id → resident_profiles.id
- waste_deposits.resident_id → resident_profiles.id
- admin_profiles.id → auth.users.id
- resident_profiles.id → auth.users.id

---

## 🎯 Complete Setup - All at Once

If many tables are missing, run complete schema:

### Option 1: Individual Migrations (Recommended)
```bash
# Run in order:
1. Base tables (admin_profiles, resident_profiles)
2. Fee table: /MIGRATION-CREATE-FEES-TABLE.sql
3. Other tables as needed
```

### Option 2: Complete Schema (Nuclear Option)
```sql
-- WARNING: This drops and recreates ALL tables!
-- Use file: /supabase-schema.sql
-- Only use if starting fresh!
```

---

## ✅ Final Verification

After creating all tables, run this comprehensive check:

```sql
-- ============================================
-- COMPREHENSIVE DATABASE CHECK
-- ============================================

-- 1. Check all required tables exist
SELECT 
  COUNT(*) as total_tables,
  COUNT(CASE WHEN table_name = 'admin_profiles' THEN 1 END) as has_admin,
  COUNT(CASE WHEN table_name = 'resident_profiles' THEN 1 END) as has_resident,
  COUNT(CASE WHEN table_name = 'fees' THEN 1 END) as has_fees,
  COUNT(CASE WHEN table_name = 'waste_deposits' THEN 1 END) as has_waste,
  COUNT(CASE WHEN table_name = 'schedules' THEN 1 END) as has_schedule
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Check RLS is enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check record counts
SELECT 'admin_profiles' as table_name, COUNT(*) as records FROM admin_profiles
UNION ALL
SELECT 'resident_profiles', COUNT(*) FROM resident_profiles
UNION ALL
SELECT 'fees', COUNT(*) FROM fees
UNION ALL
SELECT 'waste_deposits', COUNT(*) FROM waste_deposits
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules;

-- 4. Check foreign key constraints
SELECT COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_schema = 'public';
```

**Expected Output:**
```
total_tables: 5 or more
has_admin: 1
has_resident: 1
has_fees: 1
has_waste: 1
has_schedule: 1

All tables should have RLS: ✅ Enabled
Records can be 0 or more (OK if 0 for new setup)
total_foreign_keys: 4 or more
```

---

## 🆘 Still Having Issues?

**Send me:**

1. **Output** of "CHECK ALL TABLES" query (first query in this doc)
2. **Screenshot** of Table Editor in Supabase
3. **Specific error message** from application
4. **Which page/feature** is failing

---

## 📚 Related Documentation

| File | Purpose |
|------|---------|
| `/FIX-FEES-TABLE-NOW.md` | Fix missing `fees` table |
| `/MIGRATION-CREATE-FEES-TABLE.sql` | Create fees table SQL |
| `/MIGRATION-CREATE-ALL-MISSING-TABLES.sql` | Create all missing tables |
| `/supabase-schema.sql` | Complete database schema |

---

## 🚀 Quick Action

1. **Login:** https://supabase.com
2. **SQL Editor:** Run "CHECK ALL TABLES" query above
3. **Fix missing:** Follow instructions for each missing table
4. **Verify:** Run "Final Verification" query
5. **Test app:** Refresh and test all features

---

**Most Common Issue:** Missing `fees` table
**Quick Fix:** `/FIX-FEES-TABLE-NOW.md`

**LET'S CHECK YOUR DATABASE! 🔍**

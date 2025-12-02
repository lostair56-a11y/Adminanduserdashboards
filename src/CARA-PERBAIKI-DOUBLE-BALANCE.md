# 🔧 Cara Memperbaiki Bug Double Balance Bank Sampah

## 📋 Problem
Input setoran Rp 3.000 tetapi saldo bertambah Rp 6.000 (2x lipat)

**Contoh Kasus:**
- Saldo awal: Rp 627.000
- Input setoran: Rp 3.000
- Saldo seharusnya: Rp 630.000
- Saldo actual: Rp 633.000 ❌ (kelebihan Rp 3.000)

## 🔍 Root Cause
1. **Trigger database** kemungkinan ter-create duplikat sehingga berjalan 2 kali
2. **Trigger hanya handle INSERT**, tidak handle UPDATE dan DELETE
3. Fungsi `updateWasteDeposit` di backend masih ada **manual update balance**

## ✅ Solusi

### Step 1: Jalankan Migration SQL
Buka **Supabase Dashboard** → **SQL Editor** → Copy paste isi file `FIX-DOUBLE-BALANCE-BUG.sql`

File ini akan:
- ✅ Drop semua trigger yang duplikat
- ✅ Buat trigger baru yang comprehensive untuk INSERT, UPDATE, DELETE
- ✅ Tambah kolom `rt` dan `rw` di tabel `waste_deposits` (jika belum ada)

### Step 2: Deploy Backend Code
Backend sudah diperbaiki di file `/supabase/functions/server/wastebank.tsx`:
- ✅ **SUDAH DIHAPUS** manual update balance di `updateWasteDeposit()`
- ✅ Sekarang hanya rely pada database trigger

### Step 3: Testing
1. **Login sebagai Admin RT**
2. **Buka menu Bank Sampah**
3. **Catat saldo warga** (misal: Rp 633.000)
4. **Tambah setoran sampah** dengan nilai kecil (misal: Plastik 1 kg = Rp 3.000)
5. **Check saldo baru** harus **tepat bertambah Rp 3.000** (Rp 636.000) ✅

### Step 4: Verifikasi Trigger
Jalankan query ini di Supabase SQL Editor:

```sql
-- Check triggers (harus ada 3 triggers)
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'waste_deposits'
ORDER BY trigger_name;
```

**Expected Output:**
```
trigger_name                    | event_manipulation | event_object_table
--------------------------------+-------------------+-------------------
after_waste_deposit_delete      | DELETE            | waste_deposits
after_waste_deposit_insert      | INSERT            | waste_deposits
after_waste_deposit_update      | UPDATE            | waste_deposits
```

## 🎯 Penjelasan Trigger Baru

### 1. INSERT Trigger
```sql
CREATE TRIGGER after_waste_deposit_insert
  AFTER INSERT ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION handle_waste_deposit_insert();
```
- Ketika **tambah setoran baru**
- Balance bertambah sesuai `NEW.total_value`

### 2. UPDATE Trigger
```sql
CREATE TRIGGER after_waste_deposit_update
  AFTER UPDATE ON waste_deposits
  FOR EACH ROW
  WHEN (OLD.total_value IS DISTINCT FROM NEW.total_value)
  EXECUTE FUNCTION handle_waste_deposit_update();
```
- Ketika **edit setoran**
- Balance bertambah/berkurang sesuai **selisih** (NEW - OLD)

### 3. DELETE Trigger
```sql
CREATE TRIGGER after_waste_deposit_delete
  AFTER DELETE ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION handle_waste_deposit_delete();
```
- Ketika **hapus setoran**
- Balance berkurang sesuai `OLD.total_value`

## 🧪 Test Case Lengkap

### Test 1: INSERT (Tambah Setoran)
```sql
-- Saldo awal: 627.000
INSERT INTO waste_deposits (resident_id, waste_type, weight, price_per_kg, total_value, date, rt, rw)
VALUES ('xxx', 'Plastik', 1, 3000, 3000, CURRENT_DATE, '001', '002');

-- Expected: Balance = 630.000 ✅
```

### Test 2: UPDATE (Edit Setoran)
```sql
-- Saldo: 630.000, setoran awal: 3.000
UPDATE waste_deposits 
SET weight = 2, total_value = 6000 
WHERE id = 'xxx';

-- Expected: Balance = 633.000 (627.000 + 6.000) ✅
-- Trigger menghitung: 6000 - 3000 = +3000
```

### Test 3: DELETE (Hapus Setoran)
```sql
-- Saldo: 633.000, setoran: 6.000
DELETE FROM waste_deposits WHERE id = 'xxx';

-- Expected: Balance = 627.000 (kembali seperti semula) ✅
```

## 🚨 Jika Masih Error

### Error: Trigger sudah ada
```
ERROR: trigger "after_waste_deposit" already exists
```
**Solusi:** Tambahkan `IF EXISTS` di DROP TRIGGER (sudah ada di migration SQL)

### Error: Column rt/rw tidak ada
```
ERROR: column "rt" does not exist
```
**Solusi:** Migration SQL sudah handle ini dengan `DO $$ BEGIN...END $$`

### Error: Balance masih double
**Kemungkinan penyebab:**
1. Migration SQL belum dijalankan
2. Trigger lama masih ada (belum terhapus)

**Solusi:**
```sql
-- Force drop all triggers
DROP TRIGGER IF EXISTS after_waste_deposit ON waste_deposits CASCADE;
DROP TRIGGER IF EXISTS after_waste_deposit_insert ON waste_deposits CASCADE;
DROP TRIGGER IF EXISTS after_waste_deposit_update ON waste_deposits CASCADE;
DROP TRIGGER IF EXISTS after_waste_deposit_delete ON waste_deposits CASCADE;

-- Lalu jalankan ulang migration SQL
```

## 📊 Monitoring Balance

Query untuk check balance history:
```sql
SELECT 
  rp.name,
  rp.waste_bank_balance,
  COUNT(wd.id) as total_deposits,
  SUM(wd.total_value) as total_value_sum
FROM resident_profiles rp
LEFT JOIN waste_deposits wd ON wd.resident_id = rp.id
WHERE rp.id = 'xxx'
GROUP BY rp.id, rp.name, rp.waste_bank_balance;
```

## ✨ Kesimpulan

Setelah fix ini:
- ✅ Input Rp 3.000 → Balance +Rp 3.000 (bukan +Rp 6.000)
- ✅ Edit setoran dari 3kg→5kg → Balance update sesuai selisih
- ✅ Hapus setoran → Balance dikurangi otomatis
- ✅ Tidak ada lagi manual update balance di backend
- ✅ Semua operasi CRUD bank sampah sudah reliable

**Timestamp Fix:** December 1, 2025

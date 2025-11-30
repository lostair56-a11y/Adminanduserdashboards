# 🔧 FIX: SQL Syntax Error - Code Fence (```)

## ❌ Error yang Terjadi
```
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "```" LINE 95: ``` ^
```

## 🎯 Penyebab Masalah

Error ini terjadi karena **copy-paste SQL dari file Markdown (.md) dan ikut menyalin code fence markdown** (``` ```).

### Contoh Yang Salah ❌
Jika Anda copy dari file `.md` seperti ini:
```sql
-- Query SQL
SELECT * FROM fees;
```

Dan paste langsung ke Supabase SQL Editor, akan error karena termasuk tanda ```sql dan ```.

### Yang Benar ✅
Hanya copy isi SQL-nya saja:
```
SELECT * FROM fees;
```

## 🚀 Solusi Cepat

### Opsi 1: Gunakan File SQL Clean (RECOMMENDED)

Saya sudah buatkan file SQL yang clean tanpa markdown syntax:

**File:** `/MIGRATION-CLEAN-NO-MARKDOWN.sql`

**Cara pakai:**
1. Buka file `/MIGRATION-CLEAN-NO-MARKDOWN.sql`
2. Copy **SEMUA** isinya (tanpa code fence)
3. Buka Supabase Dashboard → SQL Editor
4. Paste dan Run

File ini akan:
- ✅ Create table `fees` jika belum ada
- ✅ Create table `pickup_schedules` jika belum ada  
- ✅ Add kolom `rt` dan `rw` ke `waste_deposits` jika belum ada
- ✅ Update existing data dengan RT/RW dari resident profiles
- ✅ Create semua indexes dan RLS policies
- ✅ Menampilkan verification results

### Opsi 2: Copy SQL Manual dari Markdown

Jika Anda perlu copy SQL dari file `.md`:

1. **Buka file markdown** (misalnya `/FIX-WASTE-DEPOSITS-RT-RW.md`)
2. **Cari SQL block** yang diawali dengan ```sql
3. **Copy HANYA kode SQL-nya**, jangan termasuk ```sql di awal dan ``` di akhir
4. Paste ke Supabase SQL Editor

## 📋 Checklist Before Running SQL

Sebelum menjalankan query SQL dari file manapun:

- [ ] Pastikan tidak ada code fence (```) di awal atau akhir
- [ ] Pastikan tidak ada tanda ```sql di awal
- [ ] Cek baris pertama - harus dimulai dengan SQL keyword atau comment (--)
- [ ] Cek baris terakhir - harus diakhiri dengan ; atau comment

## 🔍 Cara Identifikasi File yang Aman

### File SQL Murni ✅ (Aman langsung copy semua)
- `/MIGRATION-CLEAN-NO-MARKDOWN.sql` ← **USE THIS**
- `/MIGRATION-ADD-RT-RW-COLUMNS.sql`
- `/MIGRATION-CREATE-ALL-MISSING-TABLES.sql`
- `/supabase-schema.sql`
- `/supabase/schema.sql`

Ciri-ciri:
- Extension `.sql`
- Baris pertama biasanya `--` (comment) atau `CREATE`/`ALTER`
- Tidak ada code fence (```)

### File Dokumentasi ⚠️ (Harus extract SQL-nya)
- `/FIX-WASTE-DEPOSITS-RT-RW.md`
- `/FIX-FEES-TABLE-ERROR.md`
- Semua file `.md`

Ciri-ciri:
- Extension `.md`
- Ada code fence ```sql ... ```
- Ada penjelasan dalam Bahasa Indonesia/English
- Harus **extract SQL block** sebelum paste

## 🛠️ Langkah-Langkah Perbaikan

### Step 1: Clear SQL Editor
1. Buka Supabase Dashboard
2. Klik SQL Editor
3. Hapus semua query yang ada error

### Step 2: Run Clean Migration
1. Buka file `/MIGRATION-CLEAN-NO-MARKDOWN.sql` di code editor
2. Select All (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Paste ke Supabase SQL Editor (Ctrl+V / Cmd+V)
5. Klik **Run** atau tekan F5

### Step 3: Verify Success
Jalankan query ini untuk memastikan berhasil:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('fees', 'pickup_schedules', 'waste_deposits')
ORDER BY table_name;

-- Check waste_deposits has rt/rw columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'waste_deposits' 
AND column_name IN ('rt', 'rw');

-- Check fees table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fees'
ORDER BY ordinal_position;
```

Expected results:
- ✅ 3 tables: fees, pickup_schedules, waste_deposits
- ✅ waste_deposits memiliki kolom rt dan rw
- ✅ fees table memiliki semua kolom yang diperlukan

## 📊 Troubleshooting

### Error: "relation already exists"
**Artinya:** Table sudah dibuat sebelumnya

**Solusi:** Skip atau jalankan query verification di atas untuk confirm table structure

### Error: "column already exists"  
**Artinya:** Kolom rt/rw sudah ada di waste_deposits

**Solusi:** Bagus! Lanjut ke step berikutnya

### Error: "permission denied"
**Artinya:** User tidak punya permission untuk create table

**Solusi:** 
1. Pastikan Anda login sebagai owner project di Supabase
2. Atau gunakan service_role key (DANGER - hati-hati!)

### Still getting syntax error?
**Check:**
1. Apakah masih ada ``` di query?
2. Apakah ada special characters yang aneh?
3. Coba copy dari `/MIGRATION-CLEAN-NO-MARKDOWN.sql` lagi

## ✅ Verification Complete

Setelah berhasil run migration, test dengan:

1. **Test Admin Dashboard:**
   - Login sebagai Admin RT
   - Buka Reports page
   - Should load tanpa error

2. **Test Create Fee:**
   - Buka Manage Fees
   - Create tagihan baru
   - Should save successfully

3. **Test Waste Bank:**
   - Buka Manage Waste Bank  
   - Add deposit baru
   - Should save dengan RT/RW otomatis

## 🎯 Summary

**Problem:** SQL syntax error karena code fence markdown (```)

**Root Cause:** Copy-paste dari file .md ikut menyalin markdown formatting

**Solution:** 
1. Use `/MIGRATION-CLEAN-NO-MARKDOWN.sql` (clean SQL file)
2. Atau extract SQL dari .md file tanpa code fence

**Prevention:**
- Selalu gunakan file `.sql` untuk migrations
- Jika copy dari `.md`, pastikan tidak ada ```

**Time to fix:** 2 menit

---

✅ **NEXT:** Setelah migration berhasil, lanjut refactor komponen lain dari edge functions ke db-helpers

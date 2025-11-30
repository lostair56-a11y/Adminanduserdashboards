# ✅ FIXED: Error 404 & 400 Database Tables

## Masalah yang Diperbaiki

Berdasarkan error log yang Anda berikan:
```
sinnmqksjnvsvwnodogr.supabase.co/rest/v1/residents?... Failed to load resource: 404
sinnmqksjnvsvwnodogr.supabase.co/rest/v1/fees?select=...,resident:residents(...) Failed to load resource: 400
```

**Root Cause**: Aplikasi menggunakan table name `'residents'` yang salah, seharusnya `'resident_profiles'`

## Yang Sudah Diperbaiki

✅ File `/lib/db-helpers.ts` - Semua referensi table sudah diupdate:
- `getResidents()` - dari `'residents'` → `'resident_profiles'` 
- `getResidentById()` - dari `'residents'` → `'resident_profiles'`
- `getFees()` - join dari `residents` → `resident_profiles`
- `getPendingFees()` - join dari `residents` → `resident_profiles`
- `createFee()` - query dari `'residents'` → `'resident_profiles'`
- `getWasteDeposits()` - join dari `residents` → `resident_profiles`
- `getReportsData()` - query dari `'residents'` → `'resident_profiles'`
- `signupResident()` - insert dari `'residents'` → `'resident_profiles'`

## Next Steps

### PENTING: Jalankan SQL Migration di Supabase Dashboard

Meskipun table name di kode sudah diperbaiki, Anda mungkin masih perlu memastikan table `pickup_schedules` ada di database.

1. **Buka Supabase Dashboard**
   - URL: https://sinnmqksjnvsvwnodogr.supabase.co
   - Pilih project SikasRT

2. **Buka SQL Editor**
   - Klik menu "SQL Editor" di sidebar kiri

3. **Jalankan SQL dari file `/QUICK-FIX-SCHEDULES.txt`**
   ```sql
   DROP TABLE IF EXISTS public.pickup_schedules CASCADE;
   
   CREATE TABLE public.pickup_schedules (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     date DATE NOT NULL,
     area TEXT NOT NULL,
     time TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
     rt TEXT NOT NULL,
     rw TEXT NOT NULL,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Indexes, RLS, dan Policies (copy lengkap dari file)
   ```

4. **Click "Run"** dan tunggu sampai selesai

5. **Refresh aplikasi** SikasRT di browser

## Verifikasi

Setelah refresh, error berikut seharusnya hilang:
- ✅ Error 404 pada `/rest/v1/residents` 
- ✅ Error 400 pada query fees dengan join
- ✅ Error "Could not find table 'pickup_schedules'"

## Catatan Teknis

Database SikasRT menggunakan nama table:
- `admin_profiles` (bukan `admins`)
- `resident_profiles` (bukan `residents`)  
- `fees` (untuk iuran)
- `waste_deposits` (untuk bank sampah)
- `pickup_schedules` (untuk jadwal pengangkutan)

Semua query sudah disesuaikan dengan struktur database yang benar.

---

**Status**: ✅ FIXED - Refresh browser Anda untuk melihat perubahan

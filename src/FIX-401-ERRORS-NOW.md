# 🔧 FIX ERROR 401 - UNAUTHORIZED ACCESS

## ❌ Masalah Yang Terjadi
```
Failed to load resource: the server responded with a status of 401 ()
- admin_profiles?select=*&id=eq.xxx → 401
- resident_profiles?select=*&id=eq.xxx → 401  
- fees?select=... → 400 (syntax error fixed)
```

## ✅ Solusi - Jalankan Migration SQL

### Langkah 1: Buka Supabase Dashboard
1. Kunjungi https://supabase.com/dashboard
2. Pilih project "SikasRT" 
3. Klik menu **SQL Editor** di sidebar kiri

### Langkah 2: Jalankan Migration
1. Klik tombol **New query**
2. Copy seluruh isi file `/MIGRATION-FIX-RLS-POLICIES.sql`
3. Paste ke SQL Editor
4. Klik tombol **Run** atau tekan `Ctrl + Enter`

### Langkah 3: Verifikasi
Setelah migration berhasil, Anda akan melihat output:
```
Success. No rows returned
```

## 🔍 Apa Yang Diperbaiki?

### 1. **RLS Policies untuk Admin & Resident Profiles**
- ✅ Users bisa read/insert/update profile mereka sendiri
- ✅ Admin bisa read/manage residents di RT/RW yang sama
- ✅ Tidak ada circular dependency

### 2. **Table `fees` dengan RLS Policies**
- ✅ Residents bisa lihat iuran mereka sendiri
- ✅ Admin bisa manage iuran di RT/RW yang sama
- ✅ Syntax query diperbaiki (single line select)

### 3. **Table `waste_deposits` dengan RLS Policies**
- ✅ Residents bisa lihat deposit sampah mereka
- ✅ Admin bisa manage deposit sampah di RT/RW yang sama

### 4. **Table `pickup_schedules` dengan RLS Policies**
- ✅ Semua user (admin & resident) bisa lihat jadwal di RT/RW mereka
- ✅ Hanya admin yang bisa create/update/delete jadwal

## 🚀 Setelah Migration

### Clear Cache & Test
```bash
# Di browser, tekan:
Ctrl + Shift + R   # Windows/Linux
Cmd + Shift + R    # Mac
```

### Test Login
1. Login sebagai Admin RT
2. Cek apakah dashboard muncul tanpa error 401
3. Cek data warga, iuran, jadwal muncul dengan benar

## 📝 File Yang Sudah Diperbaiki

### ✅ `/lib/db-helpers.ts`
- Query `getFees()` → single line select
- Query `getPendingFees()` → single line select  
- Query `getWasteDeposits()` → single line select

### ✅ Database Schema
- RLS policies lebih sederhana dan efektif
- Tidak ada circular dependency
- Mendukung isolasi RT/RW dengan benar

## ⚠️ Catatan Penting

1. **Migration harus dijalankan sebelum test aplikasi**
2. **Setelah migration, CLEAR CACHE browser**
3. **Jika masih ada error, cek Console untuk error baru**

## 🎯 Next Steps After Fix

Setelah error 401 teratasi:
1. ✅ Test semua fitur CRUD (Create, Read, Update, Delete)
2. ✅ Test isolasi RT/RW (admin hanya lihat data RT/RW mereka)
3. ✅ Test upload bukti pembayaran
4. ✅ Test grafik dan laporan

## 🆘 Jika Masih Error

Jika setelah migration masih ada error:
1. Screenshot error di Console
2. Cek tab Network untuk melihat request yang gagal
3. Verifikasi token authentication masih valid (logout-login)

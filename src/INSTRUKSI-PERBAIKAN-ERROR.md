# 🔧 INSTRUKSI PERBAIKAN ERROR 401 & 400

## 📌 Ringkasan Masalah
```
❌ Error 401: admin_profiles, resident_profiles tidak bisa diakses
❌ Error 400: Query fees gagal (syntax error)
❌ Error 404: favicon.ico tidak ditemukan
```

## ✅ Solusi Lengkap Sudah Diterapkan

### 1. Kode Aplikasi (Sudah Diperbaiki)
- ✅ `/lib/db-helpers.ts` - Query syntax diperbaiki
- ✅ `/index.html` - Favicon reference dihapus

### 2. Database Schema (Perlu Dijalankan Manual)
- ⚠️ **HARUS JALANKAN** `/MIGRATION-FIX-RLS-POLICIES.sql`

---

## 🚀 CARA MENJALANKAN PERBAIKAN

### Buka Supabase Dashboard
```
1. https://supabase.com/dashboard
2. Pilih project SikasRT
3. Klik SQL Editor
```

### Jalankan SQL Migration
```
1. Klik "New query"
2. Copy isi file: /MIGRATION-FIX-RLS-POLICIES.sql
3. Paste ke SQL Editor
4. Klik "Run" atau Ctrl+Enter
5. Tunggu sampai "Success"
```

### Clear Cache Browser
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Test Aplikasi
```
1. Login sebagai Admin RT
2. Cek Dashboard (tidak ada error 401)
3. Cek Data Warga (muncul dengan benar)
4. Cek Console (F12) - tidak ada error merah
```

---

## 🔍 Yang Diperbaiki di Migration SQL

### RLS Policies
- Admin bisa read/write profile sendiri
- Admin bisa manage residents di RT/RW yang sama
- Residents bisa read profile sendiri
- Tidak ada circular dependency

### Tables
- `fees` - Table iuran dengan RLS policies
- `waste_deposits` - Table bank sampah dengan RLS policies
- `pickup_schedules` - Table jadwal dengan RLS policies

### Permissions
- Isolasi RT/RW berfungsi dengan benar
- Admin hanya lihat data RT/RW mereka
- Resident hanya lihat data mereka sendiri

---

## ✨ Hasil Setelah Perbaikan

### Aplikasi Berfungsi Normal
- ✅ Login Admin & Warga
- ✅ Dashboard tanpa error
- ✅ Data warga muncul
- ✅ Data iuran muncul
- ✅ Jadwal sampah muncul
- ✅ Bank sampah berfungsi
- ✅ Upload bukti bayar berfungsi
- ✅ Grafik dan laporan muncul

### Console Browser Bersih
- ✅ Tidak ada error 401
- ✅ Tidak ada error 400
- ✅ Tidak ada error 404
- ✅ Semua query status 200

---

## 📁 File Referensi

| File | Keterangan |
|------|------------|
| `/MIGRATION-FIX-RLS-POLICIES.sql` | **WAJIB JALANKAN** di Supabase |
| `/START-FIX-NOW.md` | Panduan 3 langkah mudah |
| `/FIX-401-ERRORS-NOW.md` | Panduan lengkap detail |
| `/FIXES-APPLIED-SUMMARY.md` | Ringkasan semua perbaikan |

---

## ⚠️ Penting!

1. **Jalankan migration SQL sebelum test**
2. **Clear cache browser setelah migration**
3. **Logout-login jika masih error**

---

## 🎯 Action Sekarang

**JALANKAN `/MIGRATION-FIX-RLS-POLICIES.sql` DI SUPABASE SQL EDITOR!**

Setelah itu, aplikasi siap digunakan tanpa error.

# 🔧 Cara Menjalankan Migration untuk Menambahkan Kelurahan ke Admin Profiles

## ⚠️ PENTING - WAJIB DIBACA

Error **"Error fetching residents: Error: Gagal mengambil data warga"** terjadi karena database belum memiliki kolom `kelurahan`, `kecamatan`, dan `kota` di tabel `admin_profiles`.

Migration ini **HARUS** dijalankan secara manual di Supabase SQL Editor untuk memperbaiki error tersebut.

---

## 📋 Langkah-Langkah Migration

### Langkah 1: Login ke Supabase Dashboard
1. Buka browser dan akses https://supabase.com
2. Klik tombol **"Sign In"** 
3. Login dengan akun Supabase Anda
4. Pilih project aplikasi RT yang sedang Anda kembangkan

### Langkah 2: Buka SQL Editor
1. Di sidebar kiri dashboard Supabase, cari dan klik menu **"SQL Editor"**
2. Klik tombol **"New Query"** untuk membuat query baru

### Langkah 3: Copy SQL Migration
1. Buka file **`/MIGRATION-ADD-KELURAHAN.sql`** di project Anda
2. Copy **SELURUH ISI** file tersebut (dari baris pertama sampai terakhir)

### Langkah 4: Jalankan Migration
1. Paste SQL yang sudah dicopy ke SQL Editor di Supabase
2. Klik tombol **"Run"** atau tekan **Ctrl+Enter** (Windows/Linux) atau **Cmd+Enter** (Mac)
3. Tunggu beberapa detik hingga proses selesai

### Langkah 5: Verifikasi Hasil Migration
Setelah migration berhasil dijalankan, Anda akan melihat output seperti ini:

```
NOTICE:  Column kelurahan added to admin_profiles table
NOTICE:  Column kecamatan added to admin_profiles table
NOTICE:  Column kota added to admin_profiles table
```

Atau jika kolom sudah ada sebelumnya:

```
NOTICE:  Column kelurahan already exists in admin_profiles table
NOTICE:  Column kecamatan already exists in admin_profiles table
NOTICE:  Column kota already exists in admin_profiles table
```

**Kedua hasil di atas menandakan migration berhasil!** ✅

---

## 🧪 Testing Setelah Migration

### 1. Refresh Aplikasi
- Buka aplikasi RT Management System di browser
- Tekan **Ctrl+Shift+R** (Windows/Linux) atau **Cmd+Shift+R** (Mac) untuk hard refresh
- Ini akan memastikan cache browser di-clear dan menggunakan kode terbaru

### 2. Login sebagai Admin RT
- Masukkan email dan password admin
- Login ke dashboard admin

### 3. Test Menu Kelola Data Warga
- Klik menu **"Kelola Data Warga"** di sidebar
- Data warga seharusnya tampil tanpa error
- Buka **Developer Console** (tekan F12)
- Pastikan tidak ada error merah di console

### 4. Test Fungsionalitas CRUD
Pastikan semua operasi berikut berfungsi dengan baik:
- ✅ View: Melihat daftar warga
- ✅ Search: Mencari warga berdasarkan nama/alamat
- ✅ Filter: Memfilter data warga
- ✅ Create: Menambah warga baru (jika ada fitur ini)
- ✅ Update: Edit data warga
- ✅ Delete: Hapus data warga

---

## 🐛 Troubleshooting

### Problem: Migration gagal dengan error "permission denied"
**Solusi**: 
- Pastikan Anda menggunakan akun Supabase yang memiliki akses ke project tersebut
- Pastikan Anda owner atau memiliki role admin di project tersebut

### Problem: Masih muncul error setelah migration
**Solusi**:
1. Pastikan migration benar-benar berhasil (cek output NOTICE)
2. Lakukan hard refresh browser (Ctrl+Shift+R)
3. Logout dan login kembali
4. Periksa apakah ada error lain di browser console

### Problem: Kolom sudah ada tapi tetap error
**Solusi**:
1. Buka SQL Editor di Supabase
2. Jalankan query berikut untuk mengecek struktur tabel:
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'admin_profiles'
   ORDER BY ordinal_position;
   ```
3. Pastikan kolom `kelurahan`, `kecamatan`, dan `kota` ada di hasil query

### Problem: Error "admin_profiles does not exist"
**Solusi**:
Ini berarti tabel utama belum dibuat. Anda perlu menjalankan schema utama terlebih dahulu:
1. Buka file `/supabase-schema.sql`
2. Copy seluruh isinya
3. Paste dan jalankan di SQL Editor Supabase
4. Setelah berhasil, baru jalankan migration kelurahan

---

## 📝 Catatan Penting

1. **Migration Bersifat Idempotent**: Migration ini aman dijalankan berulang kali. Jika kolom sudah ada, migration tidak akan membuat duplikat.

2. **Default Values**: Admin yang sudah terdaftar sebelumnya akan mendapat nilai default 'N/A' untuk kolom kelurahan, kecamatan, dan kota.

3. **Backward Compatibility**: Aplikasi tetap akan berfungsi normal karena field-field baru bersifat opsional.

4. **Update Manual (Opsional)**: Jika ingin mengupdate data admin yang sudah ada:
   ```sql
   UPDATE admin_profiles 
   SET kelurahan = 'Kelurahan Baru', 
       kecamatan = 'Kecamatan Baru',
       kota = 'Kota Baru'
   WHERE email = 'email-admin@example.com';
   ```

---

## ✅ Checklist Keberhasilan

Pastikan semua item berikut sudah ✅ sebelum menganggap migration selesai:

- [ ] Migration SQL berhasil dijalankan di Supabase SQL Editor
- [ ] Muncul NOTICE bahwa kolom berhasil ditambahkan
- [ ] Aplikasi di-refresh dengan hard refresh (Ctrl+Shift+R)
- [ ] Login sebagai Admin RT berhasil
- [ ] Menu "Kelola Data Warga" dapat dibuka tanpa error
- [ ] Daftar warga tampil dengan benar
- [ ] Tidak ada error di browser console
- [ ] Search dan filter warga berfungsi normal
- [ ] CRUD operations (tambah, edit, hapus) berfungsi normal

---

## 🆘 Butuh Bantuan?

Jika masih mengalami masalah setelah mengikuti panduan ini:

1. Periksa kembali setiap langkah dengan teliti
2. Buka browser console (F12) dan screenshot error yang muncul
3. Periksa apakol file `/FIX-ADMIN-KELURAHAN.md` untuk informasi teknis lebih detail
4. Pastikan semua file perbaikan sudah ter-commit dan ter-deploy dengan benar

---

**Dibuat pada**: 19 November 2025  
**File Migration**: `/MIGRATION-ADD-KELURAHAN.sql`  
**Dokumentasi Teknis**: `/FIX-ADMIN-KELURAHAN.md`

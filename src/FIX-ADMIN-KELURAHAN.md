# Perbaikan Error "Gagal mengambil data warga"

## Tanggal: 19 November 2025

## Masalah
Error "Error fetching residents: Error: Gagal mengambil data warga" muncul di console browser saat Admin RT mencoba mengakses halaman Kelola Data Warga.

## Penyebab
1. Tabel `admin_profiles` tidak memiliki kolom `kelurahan`, `kecamatan`, dan `kota` seperti yang ada di tabel `resident_profiles`
2. Kode frontend di `AdminDashboard.tsx` mencoba mengakses field `kelurahan` yang tidak ada
3. Backend bisa saja gagal jika admin profile tidak lengkap atau tidak ditemukan

## Solusi yang Diterapkan

### 1. Update Database Schema
File migrasi baru dibuat: `/MIGRATION-ADD-KELURAHAN.sql`

Migration ini menambahkan 3 kolom baru ke tabel `admin_profiles`:
- `kelurahan` (TEXT, default 'N/A')
- `kecamatan` (TEXT, default 'N/A')  
- `kota` (TEXT, default 'N/A')

### 2. Update TypeScript Type
File `/lib/supabase.ts` diupdate untuk menambahkan field opsional:
```typescript
export interface AdminProfile {
  // ... existing fields
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  // ... other fields
}
```

### 3. Cara Menjalankan Migration

**PENTING**: Migration harus dijalankan di Supabase SQL Editor:

1. Login ke dashboard Supabase di https://supabase.com
2. Pilih project Anda
3. Buka menu "SQL Editor" di sidebar kiri
4. Klik "New Query"
5. Copy seluruh isi file `/MIGRATION-ADD-KELURAHAN.sql`
6. Paste ke SQL Editor
7. Klik tombol "Run" atau tekan Ctrl+Enter
8. Pastikan muncul pesan sukses bahwa kolom telah ditambahkan

### 4. Verifikasi Migration

Setelah migration berhasil dijalankan:

1. Refresh halaman aplikasi (Ctrl+Shift+R untuk hard refresh)
2. Login sebagai Admin RT
3. Akses menu "Kelola Data Warga"
4. Periksa console browser - error seharusnya sudah tidak muncul lagi
5. Data warga seharusnya tampil dengan benar

### 5. Update Data Admin yang Sudah Ada (Opsional)

Jika Anda ingin mengupdate data admin yang sudah ada dengan kelurahan yang sebenarnya:

```sql
-- Update kelurahan untuk admin tertentu
UPDATE admin_profiles 
SET kelurahan = 'Nama Kelurahan', 
    kecamatan = 'Nama Kecamatan',
    kota = 'Nama Kota'
WHERE email = 'email-admin@example.com';
```

## Catatan Penting

1. **Default Values**: Kolom baru memiliki default value 'N/A' untuk admin yang sudah terdaftar
2. **Backward Compatibility**: Aplikasi tetap akan berfungsi untuk admin lama karena field bersifat opsional (?)
3. **Frontend Update**: Tidak perlu perubahan kode frontend karena sudah menggunakan optional chaining (`?.`)
4. **Registrasi Baru**: Admin yang mendaftar baru dapat diminta untuk mengisi kelurahan, kecamatan, dan kota jika diperlukan

## Status
✅ Migration SQL file sudah dibuat
✅ TypeScript type sudah diupdate
⚠️ **PENDING**: Migration perlu dijalankan manual di Supabase SQL Editor

## Testing Checklist

Setelah migration dijalankan, test hal berikut:

- [ ] Admin bisa login tanpa error
- [ ] Halaman Dashboard tampil dengan benar
- [ ] Menu "Kelola Data Warga" bisa dibuka
- [ ] Data warga tampil dengan lengkap
- [ ] Tidak ada error di browser console
- [ ] Filter dan search warga berfungsi normal
- [ ] CRUD operations (Create, Read, Update, Delete) warga berfungsi normal

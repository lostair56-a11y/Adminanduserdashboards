# Perbaikan Error Create Bill (Tambah Tagihan)

## Masalah yang Terjadi

Error saat membuat tagihan baru:
- **Error 406**: Terjadi saat mengecek duplikasi tagihan
- **Error 400**: Terjadi saat insert data ke tabel fee_payments (kolom `due_date` dan `payment_proof` tidak ada)

## Root Cause

Tabel `fee_payments` di database production tidak memiliki kolom:
1. `due_date` - Untuk tanggal jatuh tempo tagihan
2. `payment_proof` - Untuk menyimpan bukti transfer

## Solusi yang Sudah Diterapkan

### 1. Update Code di `/lib/db-helpers.ts`

✅ Fungsi `createFee()` sudah diperbaiki:
- Mengganti `.maybeSingle()` dengan query array untuk menghindari error 406
- Menambahkan validasi format due_date
- Menambahkan logging yang lebih detail
- Handle null values dengan benar

### 2. Update Schema File

✅ File `/supabase-schema.sql` sudah di-update dengan kolom:
- `payment_proof TEXT`
- `due_date DATE`

### 3. Migration File Dibuat

✅ File migration: `/MIGRATION-FIX-FEE-PAYMENTS-COLUMNS.sql`

## Cara Menjalankan Migration

### Opsi 1: Via Supabase Dashboard (RECOMMENDED)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project SikasRT
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste isi file `/MIGRATION-FIX-FEE-PAYMENTS-COLUMNS.sql`
6. Klik **Run** atau tekan Ctrl+Enter
7. Lihat hasilnya di output - seharusnya muncul:
   ```
   Column payment_proof added to fee_payments table
   Column due_date added to fee_payments table
   ```

### Opsi 2: Via Supabase CLI

```bash
# Masuk ke direktori project
cd /path/to/sikasrt

# Jalankan migration
supabase db execute -f MIGRATION-FIX-FEE-PAYMENTS-COLUMNS.sql
```

## Verifikasi

Setelah menjalankan migration, test kembali fitur "Tambah Tagihan":

1. Login sebagai Admin RT
2. Masuk ke menu **Kelola Iuran**
3. Klik tombol **Tambah Tagihan**
4. Isi form:
   - Pilih warga
   - Pilih bulan & tahun
   - Masukkan jumlah
   - Isi deskripsi (opsional)
   - Pilih tanggal jatuh tempo
5. Klik **Buat Tagihan**

**Expected Result**: ✅ Tagihan berhasil dibuat tanpa error

## Error yang Sudah Diperbaiki

✅ Error 406 pada query duplikasi check
✅ Error 400 pada insert fee_payments
✅ Missing column `due_date`
✅ Missing column `payment_proof`

## File yang Dimodifikasi

1. `/lib/db-helpers.ts` - Fungsi createFee()
2. `/supabase-schema.sql` - Schema tabel fee_payments
3. `/MIGRATION-FIX-FEE-PAYMENTS-COLUMNS.sql` - Migration file (baru)
4. `/MIGRATION-ADD-DUE-DATE.sql` - Migration file (baru)

## Catatan Penting

- Migration ini **AMAN** dijalankan berkali-kali (idempotent)
- Tidak akan menghapus data yang sudah ada
- Untuk existing records dengan `due_date` NULL, akan di-set otomatis ke akhir bulan yang sesuai
- Status check constraint tetap: `('paid', 'unpaid')`

## Troubleshooting

### Jika masih error setelah migration:

1. **Clear browser cache**:
   ```
   Ctrl + Shift + Del (Windows/Linux)
   Cmd + Shift + Del (Mac)
   ```

2. **Reload halaman** dengan force refresh:
   ```
   Ctrl + F5 (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. **Cek database** apakah kolom sudah ada:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'fee_payments'
   ORDER BY ordinal_position;
   ```

4. **Cek log console** di browser (F12) untuk error detail

## Next Steps

Setelah migration berhasil:
1. ✅ Test fitur Tambah Tagihan
2. ✅ Test fitur Edit Tagihan
3. ✅ Test pembayaran via Bank BRI
4. ✅ Test pembayaran via Bank Sampah
5. ✅ Verify verifikasi pembayaran oleh Admin

---

*Last Updated: 2 Desember 2025*

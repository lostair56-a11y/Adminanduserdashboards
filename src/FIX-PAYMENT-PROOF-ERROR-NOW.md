# 🔥 FIX ERROR: payment_proof Column Not Found

## Error yang Muncul
```
Error updating fee payment: {
  code: "PGRST204",
  details: null,
  hint: null,
  message: "Could not find the 'payment_proof' column of 'fee_payments' in the schema cache"
}
```

## Root Cause
❌ Kolom `payment_proof` belum ada di tabel `fee_payments` di database production Anda
✅ Migration file sudah dibuat tapi belum dijalankan

## Solusi: Jalankan Migration

### LANGKAH 1: Buka Supabase Dashboard
1. Login ke https://supabase.com
2. Pilih project SikasRT Anda
3. Klik **SQL Editor** di sidebar kiri

### LANGKAH 2: Jalankan Migration SQL

Copy dan paste SQL berikut ke SQL Editor, kemudian klik **Run**:

```sql
-- Migration: Add payment_proof column to fee_payments table
DO $$ 
BEGIN
  -- Add payment_proof column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE 'Column payment_proof added to fee_payments table';
  ELSE
    RAISE NOTICE 'Column payment_proof already exists in fee_payments table';
  END IF;
END $$;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fee_payments'
AND column_name = 'payment_proof';
```

### LANGKAH 3: Verifikasi Hasil

Setelah menjalankan SQL di atas, Anda seharusnya melihat:

1. **Output Message:**
   ```
   Column payment_proof added to fee_payments table
   ```

2. **Verification Query Result:**
   ```
   column_name    | data_type | is_nullable
   ---------------|-----------|------------
   payment_proof  | text      | YES
   ```

### LANGKAH 4: Test Aplikasi

1. Refresh aplikasi SikasRT Anda
2. Coba lakukan pembayaran iuran sebagai Warga
3. Upload bukti transfer
4. Error `PGRST204` seharusnya sudah hilang ✅

## Kenapa Error Ini Terjadi?

Sistem SikasRT mencoba menyimpan URL bukti transfer ke kolom `payment_proof` di tabel `fee_payments`, tetapi kolom tersebut belum ada di database production.

**Lokasi kode yang mengakses kolom ini:**
- `/components/resident/FeePaymentDialog.tsx` (line 144)
- `/supabase/functions/server/fees.tsx` (line 302)
- `/lib/db-helpers.ts` (line 271)

## Alternative: Hapus Referensi payment_proof (TIDAK DISARANKAN)

Jika tidak ingin menambahkan kolom, Anda bisa menghapus fitur upload bukti transfer. Namun ini **TIDAK DISARANKAN** karena:
- Mengurangi fitur penting sistem
- Admin RT tidak bisa verifikasi pembayaran
- Warga tidak bisa upload bukti transfer

## File Migration Terkait

Migration file sudah ada di:
- `/MIGRATION-ADD-PAYMENT-PROOF.sql`
- `/MIGRATION-FIX-FEE-PAYMENTS-COLUMNS.sql`

## Setelah Migration Berhasil

✅ Warga bisa upload bukti transfer saat bayar iuran
✅ Admin RT bisa lihat bukti transfer di pending payments
✅ Sistem bisa simpan URL bukti transfer di database
✅ Tidak ada lagi error PGRST204

## Troubleshooting

### Jika masih error setelah migration:

1. **Refresh Schema Cache di Supabase:**
   - Buka Supabase Dashboard
   - Klik **Database** → **Schema**
   - Refresh halaman

2. **Cek apakah kolom sudah ada:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'fee_payments';
   ```

3. **Restart Supabase PostgREST:**
   - Biasanya otomatis, tunggu 1-2 menit setelah migration
   - Atau restart project di Supabase Dashboard

## Summary

**Problem:** Kolom `payment_proof` tidak ada di database
**Solution:** Jalankan migration SQL di atas  
**Result:** Error PGRST204 akan hilang dan fitur upload bukti transfer akan berfungsi

---

**Estimated Time:** 2 menit
**Difficulty:** ⭐ Easy
**Impact:** 🔥 Critical - Fitur pembayaran tidak bisa digunakan tanpa ini

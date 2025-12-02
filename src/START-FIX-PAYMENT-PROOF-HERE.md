# 🚀 QUICK FIX: Payment Proof Error (2 Menit)

## ⚠️ Error yang Muncul
```
Could not find the 'payment_proof' column of 'fee_payments' in the schema cache
```

## 🎯 Solusi Cepat

### STEP 1: Buka Supabase SQL Editor
1. Buka https://supabase.com
2. Login → Pilih project SikasRT
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**

### STEP 2: Copy & Run SQL Ini

```sql
-- Fix fee_payments table structure
DO $$ 
BEGIN
  -- Add payment_proof column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE 'payment_proof column added';
  END IF;
END $$;
```

### STEP 3: Klik **RUN** atau tekan Ctrl+Enter

### STEP 4: Lihat Hasilnya
Anda akan melihat pesan:
```
payment_proof column added
```

### STEP 5: Refresh Aplikasi
1. Buka aplikasi SikasRT
2. Refresh halaman (F5)
3. Coba bayar iuran lagi
4. Error sudah hilang! ✅

---

## 📋 Untuk Hasil Lebih Lengkap (Opsional)

Jika ingin menambahkan semua kolom yang mungkin dibutuhkan, jalankan SQL berikut:

```sql
DO $$ 
BEGIN
  -- Add payment_proof
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fee_payments' AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
  END IF;

  -- Add due_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fee_payments' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN due_date DATE;
  END IF;

  -- Add verified_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fee_payments' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN verified_at TIMESTAMPTZ;
  END IF;
END $$;
```

---

## ✅ Hasil Akhir

Setelah migration berhasil:
- ✅ Warga bisa upload bukti transfer
- ✅ Admin bisa lihat bukti pembayaran
- ✅ Tidak ada lagi error PGRST204
- ✅ Sistem pembayaran berfungsi normal

---

## 🆘 Masih Error?

### Cek apakah kolom sudah ada:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fee_payments' 
AND column_name = 'payment_proof';
```

Jika sudah ada, tunggu 1-2 menit untuk schema cache refresh, kemudian refresh aplikasi.

---

**⏱️ Waktu:** 2 menit  
**🎯 Difficulty:** Mudah  
**💥 Priority:** URGENT - Sistem pembayaran tidak berfungsi

# 🔧 ERROR FIX: payment_proof Column Not Found

## 🚨 Error Message
```
{
  code: "PGRST204",
  message: "Could not find the 'payment_proof' column of 'fee_payments' in the schema cache"
}
```

## 🎯 Root Cause
Kolom `payment_proof` belum ada di tabel `fee_payments` di database Supabase Anda.

## ⚡ Quick Fix (30 Detik)

### Buka Supabase → SQL Editor → Run ini:

```sql
ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
```

**DONE!** ✅

---

## 🛡️ Safe Fix (Recommended)

Jika khawatir error "column already exists", gunakan ini:

```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
    RAISE NOTICE 'Column payment_proof added successfully';
  ELSE
    RAISE NOTICE 'Column payment_proof already exists';
  END IF;
END $$;
```

---

## 📋 Step-by-Step Instructions

### 1️⃣ Login ke Supabase
- Buka: https://supabase.com
- Login dengan akun Anda
- Pilih project SikasRT

### 2️⃣ Buka SQL Editor
- Klik **SQL Editor** di sidebar kiri
- Klik **+ New Query**

### 3️⃣ Paste & Run
- Copy SQL di atas
- Paste ke editor
- Klik **RUN** atau tekan **Ctrl+Enter**

### 4️⃣ Verify
Anda akan lihat salah satu pesan ini:
- ✅ `Column payment_proof added successfully`
- ✅ `Column payment_proof already exists`

### 5️⃣ Test Aplikasi
- Refresh aplikasi SikasRT (F5)
- Login sebagai Warga
- Bayar iuran
- Upload bukti transfer
- Error hilang! ✅

---

## 🔍 Verification

Cek apakah kolom sudah ada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fee_payments'
AND column_name = 'payment_proof';
```

**Expected Result:**
```
column_name    | data_type | is_nullable
---------------|-----------|------------
payment_proof  | text      | YES
```

---

## 📚 Penjelasan Teknis

### Kenapa Error Ini Terjadi?

1. **Backend mencoba save URL bukti transfer:**
   - File: `/supabase/functions/server/fees.tsx` (line 302)
   - Code: `payment_proof: paymentProofUrl`

2. **Frontend mencoba update bukti transfer:**
   - File: `/components/resident/FeePaymentDialog.tsx` (line 144)
   - Code: `.update({ payment_proof: paymentProof })`

3. **Tapi kolom tidak ada di database:**
   - Error: PGRST204 (Schema cache error)
   - Supabase PostgREST tidak bisa find column

### Solusi Permanen

Migration SQL akan menambahkan kolom `payment_proof` dengan:
- **Type:** TEXT (untuk menyimpan URL)
- **Nullable:** YES (boleh kosong)
- **Default:** NULL

---

## 🎯 Impact Setelah Fix

### ✅ Fitur yang Akan Berfungsi:
1. Upload bukti transfer saat bayar iuran
2. Admin bisa lihat bukti pembayaran di pending payments
3. Verifikasi pembayaran dengan bukti visual
4. History pembayaran dengan bukti tersimpan

### 🔧 File yang Terpengaruh:
- `/components/resident/FeePaymentDialog.tsx`
- `/components/admin/PendingPaymentsDialog.tsx`
- `/supabase/functions/server/fees.tsx`
- `/lib/db-helpers.ts`

---

## 📁 Related Files

Lihat panduan lengkap di:
- **[START-FIX-PAYMENT-PROOF-HERE.md](./START-FIX-PAYMENT-PROOF-HERE.md)** - Quick start guide
- **[VISUAL-FIX-PAYMENT-PROOF.md](./VISUAL-FIX-PAYMENT-PROOF.md)** - Visual step-by-step
- **[FIX-PAYMENT-PROOF-ERROR-NOW.md](./FIX-PAYMENT-PROOF-ERROR-NOW.md)** - Detailed guide
- **[MIGRATION-ADD-PAYMENT-PROOF.sql](./MIGRATION-ADD-PAYMENT-PROOF.sql)** - Migration file
- **[MIGRATION-FIX-FEE-PAYMENTS-COMPLETE.sql](./MIGRATION-FIX-FEE-PAYMENTS-COMPLETE.sql)** - Complete migration

---

## ⏱️ Summary

| Item | Value |
|------|-------|
| **Time to Fix** | 30 seconds - 2 minutes |
| **Difficulty** | ⭐ Easy |
| **Priority** | 🔥 Critical |
| **Impact** | High - Payment system broken |
| **Risk** | Low - Safe migration |

---

## 🆘 Still Having Issues?

### Refresh Schema Cache
```sql
NOTIFY pgrst, 'reload schema';
```

### Restart Supabase Project
1. Settings → General
2. Klik **Restart Project**
3. Tunggu 1-2 menit

### Check All Columns
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fee_payments'
ORDER BY ordinal_position;
```

---

**Last Updated:** 2 Desember 2025  
**Status:** ✅ Tested Solution  
**Tested On:** Supabase PostgreSQL 15+

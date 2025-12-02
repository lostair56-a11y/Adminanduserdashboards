# 🎨 VISUAL GUIDE: Fix Payment Proof Error

## 🔴 MASALAH
```
Error: Could not find the 'payment_proof' column
```
Warga tidak bisa upload bukti transfer → Sistem pembayaran error!

---

## ✅ SOLUSI (4 Langkah Mudah)

### 📍 LANGKAH 1: Buka Supabase
```
https://supabase.com
↓
Login
↓
Pilih Project SikasRT
```

### 📍 LANGKAH 2: Buka SQL Editor
```
Sidebar Kiri
↓
Klik: SQL Editor
↓
Klik: + New Query
```

### 📍 LANGKAH 3: Paste & Run SQL

**Copy SQL ini:**
```sql
ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
```

**Atau gunakan versi yang aman (tidak error jika sudah ada):**
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
  END IF;
END $$;
```

**Cara Run:**
1. Paste SQL ke editor
2. Klik tombol **RUN** (atau Ctrl+Enter)
3. Tunggu sampai selesai

### 📍 LANGKAH 4: Cek Hasilnya

**Lihat di bagian bawah:**
```
✅ Success
```

**Atau jalankan query verifikasi:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fee_payments';
```

**Cari di hasil:**
```
payment_proof  ← HARUS ADA INI
```

---

## 🎉 SELESAI!

### Test Aplikasi:
1. ✅ Buka aplikasi SikasRT
2. ✅ Refresh browser (F5)
3. ✅ Login sebagai Warga
4. ✅ Coba bayar iuran
5. ✅ Upload bukti transfer
6. ✅ Tidak ada error lagi!

---

## 📊 STRUKTUR TABLE YANG BENAR

Setelah migration, tabel `fee_payments` harus punya:

```
fee_payments
├── id
├── resident_id
├── amount
├── month
├── year
├── status
├── description
├── payment_date
├── payment_method
├── payment_proof    ← KOLOM BARU INI
├── rt
├── rw
├── created_at
└── updated_at
```

---

## ❓ Troubleshooting

### ❌ Error: "column already exists"
**Artinya:** Kolom sudah ada, tidak perlu migration
**Solusi:** Refresh aplikasi, error seharusnya sudah hilang

### ❌ Error: "permission denied"
**Artinya:** User database tidak punya akses
**Solusi:** Login sebagai owner project atau user dengan role SUPERUSER

### ❌ Masih error setelah migration
**Solusi:**
1. Tunggu 1-2 menit (schema cache perlu refresh)
2. Restart project Supabase:
   - Settings → General → Restart Project
3. Clear browser cache
4. Refresh aplikasi

---

## 🔗 File Terkait

Lihat juga:
- `/START-FIX-PAYMENT-PROOF-HERE.md` - Panduan quick fix
- `/MIGRATION-ADD-PAYMENT-PROOF.sql` - File migration lengkap
- `/MIGRATION-FIX-FEE-PAYMENTS-COMPLETE.sql` - Migration semua kolom

---

**Dibuat:** 2 Desember 2025  
**Status:** ✅ Tested & Working  
**Waktu:** 2-3 menit

# Cara Menjalankan Migration untuk Menambahkan Kolom Description

## Error yang Muncul
```
Error creating bill: Error: Could not find the 'description' column of 'fee_payments' in the schema cache
```

## Solusi

Error ini terjadi karena kolom `description` belum ada di database Supabase Anda. Ikuti langkah-langkah berikut untuk memperbaikinya:

### Opsi 1: Menggunakan Supabase Dashboard (Paling Mudah)

1. **Buka Supabase Dashboard**
   - Kunjungi https://supabase.com/dashboard
   - Login dan pilih project Anda

2. **Buka SQL Editor**
   - Di sidebar kiri, klik **SQL Editor**
   - Klik **New Query**

3. **Jalankan Migration**
   - Copy semua isi dari file `MIGRATION-ADD-DESCRIPTION.sql`
   - Paste ke SQL Editor
   - Klik tombol **Run** atau tekan `Ctrl+Enter`

4. **Verifikasi**
   - Klik **Table Editor** di sidebar
   - Pilih tabel `fee_payments`
   - Pastikan kolom `description` sudah muncul dengan tipe `text`

### Opsi 2: Menggunakan SQL Query Langsung

Jika Anda lebih suka menggunakan query sederhana, jalankan query berikut di SQL Editor:

```sql
-- Tambahkan kolom description ke tabel fee_payments
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS description TEXT;
```

### Opsi 3: Recreate Table (Jika Data Belum Penting)

⚠️ **PERINGATAN: Ini akan menghapus semua data di tabel fee_payments!**

Hanya gunakan opsi ini jika Anda belum memiliki data penting atau masih dalam tahap development.

1. Buka SQL Editor di Supabase Dashboard
2. Jalankan query berikut:

```sql
-- Hapus tabel lama
DROP TABLE IF EXISTS fee_payments CASCADE;

-- Buat ulang dengan struktur lengkap
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resident_id, month, year)
);

-- Enable RLS
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Residents can view their own payments"
  ON fee_payments FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON fee_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert payments"
  ON fee_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payments"
  ON fee_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- Trigger untuk mengurangi saldo bank sampah
CREATE OR REPLACE FUNCTION deduct_waste_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'Bank Sampah' AND NEW.status = 'paid' THEN
    UPDATE resident_profiles
    SET waste_bank_balance = waste_bank_balance - NEW.amount
    WHERE id = NEW.resident_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_payment_update
  AFTER UPDATE ON fee_payments
  FOR EACH ROW
  WHEN (OLD.status = 'unpaid' AND NEW.status = 'paid')
  EXECUTE FUNCTION deduct_waste_bank_balance();
```

## Verifikasi Setelah Migration

Setelah menjalankan migration, coba fitur berikut untuk memastikan semuanya berfungsi:

1. **Login sebagai Admin RT**
2. **Buka menu Manajemen Iuran**
3. **Klik "Buat Tagihan Baru"**
4. **Isi semua field termasuk Keterangan (opsional)**
5. **Klik "Buat Tagihan"**

Jika tidak ada error lagi, berarti migration berhasil! 🎉

## Troubleshooting

### Jika masih muncul error yang sama:

1. **Refresh Schema Cache**
   - Di Supabase Dashboard, klik icon **Refresh** di pojok kanan atas
   - Atau logout dan login kembali ke aplikasi Anda

2. **Clear Browser Cache**
   - Tekan `Ctrl+Shift+R` (Windows/Linux) atau `Cmd+Shift+R` (Mac)
   - Atau buka aplikasi dalam mode Incognito/Private

3. **Restart Supabase Functions** (jika menggunakan Edge Functions)
   - Di Supabase Dashboard, buka **Edge Functions**
   - Deploy ulang function `make-server-64eec44a`

## Kontak Support

Jika masih mengalami masalah setelah mencoba semua langkah di atas, silakan:
- Periksa Logs di Supabase Dashboard > Logs
- Cek apakah ada error di browser console (F12 > Console)

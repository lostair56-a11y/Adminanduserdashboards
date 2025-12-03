# Debug: Kenapa Admin Tidak Bisa Hapus Data Warga?

## Penyebab Umum:

### 1. **RLS Policy DELETE tidak ada atau terlalu ketat**
   - Tabel `resident_profiles` tidak punya policy untuk DELETE
   - Atau policy DELETE ada tapi kondisi RT/RW tidak cocok

### 2. **Foreign Key Constraint**
   - Data warga terhubung dengan tabel lain (fee_payments, waste_bank_transactions)
   - Supabase mencegah delete karena ada referensi

### 3. **Permission Supabase**
   - User yang login bukan admin
   - RT/RW admin tidak sama dengan RT/RW warga yang mau dihapus

---

## Solusi Cepat:

### ✅ SOLUSI 1: Fix RLS Policy (WAJIB DICOBA DULU)

Jalankan file `/FIX-SEMUA-RLS-POLICIES.sql` di Supabase SQL Editor.

File ini akan:
- Menambahkan policy DELETE untuk resident_profiles
- Memperbaiki semua policy untuk tabel lain
- Memastikan admin bisa CRUD data di RT/RW yang sama

**Cara menjalankan:**
1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi `/FIX-SEMUA-RLS-POLICIES.sql`
3. Klik RUN
4. Lihat hasil query di bagian bawah
5. Test delete warga lagi di aplikasi

---

### ✅ SOLUSI 2: Cek Error Message

Setelah klik tombol hapus, buka Console (F12) dan lihat error yang muncul:

#### Error: "new row violates row-level security policy"
**Artinya**: RLS policy menolak operasi DELETE
**Solusi**: Jalankan `/FIX-SEMUA-RLS-POLICIES.sql`

#### Error: "violates foreign key constraint"
**Artinya**: Data warga masih punya relasi ke tabel lain (fee_payments, dll)
**Solusi**: Lihat SOLUSI 3 di bawah

#### Error: "permission denied"
**Artinya**: User tidak punya akses
**Solusi**: Pastikan login sebagai Admin RT yang benar

---

### ✅ SOLUSI 3: Fix Foreign Key Constraint

Jika error menyebutkan foreign key, Anda perlu CASCADE DELETE.

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Drop constraint lama
ALTER TABLE fee_payments 
DROP CONSTRAINT IF EXISTS fee_payments_resident_id_fkey;

-- Tambah constraint baru dengan CASCADE DELETE
ALTER TABLE fee_payments
ADD CONSTRAINT fee_payments_resident_id_fkey
FOREIGN KEY (resident_id)
REFERENCES resident_profiles(id)
ON DELETE CASCADE;
```

**ON DELETE CASCADE** artinya: Jika warga dihapus, semua pembayaran iurannya juga otomatis terhapus.

---

### ✅ SOLUSI 4: Debug Manual di SQL Editor

Test DELETE secara langsung untuk tahu masalah sebenarnya:

```sql
-- 1. Cek admin yang sedang login
SELECT id, email, name, rt, rw 
FROM admin_profiles 
WHERE id = auth.uid();

-- 2. Cek warga yang mau dihapus
SELECT id, name, rt, rw, email
FROM resident_profiles
WHERE id = 'PASTE_ID_WARGA_DI_SINI';

-- 3. Cek apakah RT/RW cocok
SELECT 
  ap.rt as admin_rt,
  ap.rw as admin_rw,
  rp.rt as resident_rt,
  rp.rw as resident_rw,
  CASE 
    WHEN ap.rt = rp.rt AND ap.rw = rp.rw THEN '✅ COCOK'
    ELSE '❌ TIDAK COCOK'
  END as status
FROM admin_profiles ap
CROSS JOIN resident_profiles rp
WHERE ap.id = auth.uid()
AND rp.id = 'PASTE_ID_WARGA_DI_SINI';

-- 4. Test DELETE langsung
DELETE FROM resident_profiles
WHERE id = 'PASTE_ID_WARGA_DI_SINI';
```

Jika step 4 berhasil di SQL Editor tapi gagal di aplikasi, berarti masalahnya di kode frontend.
Jika step 4 gagal di SQL Editor, berarti masalahnya di RLS atau foreign key.

---

## Checklist Troubleshooting:

- [ ] Sudah jalankan `/FIX-SEMUA-RLS-POLICIES.sql`?
- [ ] Sudah hard refresh browser (Ctrl+Shift+R)?
- [ ] Sudah cek console log untuk error message?
- [ ] Sudah pastikan login sebagai Admin RT?
- [ ] Sudah cek RT/RW admin sama dengan RT/RW warga?
- [ ] Sudah test DELETE di SQL Editor?
- [ ] Sudah fix foreign key constraint dengan CASCADE?

---

## Setelah Perbaikan:

1. **Hard refresh** browser (Ctrl+Shift+R)
2. Login sebagai Admin RT
3. Buka menu "Kelola Data Warga"
4. Klik tombol hapus (trash icon) pada salah satu warga
5. Konfirmasi hapus
6. Seharusnya muncul toast "Data warga berhasil dihapus"
7. Tabel otomatis refresh dan warga hilang dari list

---

## Masih Error?

Paste error message lengkap dari Console (F12) dan screenshot error yang muncul.
Kita akan debug lebih lanjut!

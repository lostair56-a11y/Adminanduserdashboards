# Cara Update RLS Policy di Supabase

## 🚨 PENTING - Pilih SQL Yang Tepat:

Ada 2 file SQL yang bisa Anda gunakan:

### Option 1: Fix Semua RLS (RECOMMENDED) ✅
**File**: `/FIX-SEMUA-RLS-POLICIES.sql`
- Memperbaiki SEMUA tabel sekaligus (resident_profiles, fee_payments, waste_bank_transactions, pickup_schedules)
- Lengkap dengan SELECT, INSERT, UPDATE, DELETE untuk setiap tabel
- Cocok untuk fix menyeluruh satu kali jalan
- **Gunakan ini jika Anda ingin perbaikan lengkap!**

### Option 2: Fix Resident Profiles Saja
**File**: `/FIX-RLS-RESIDENT-UPDATE.sql`
- Hanya memperbaiki tabel resident_profiles
- Untuk UPDATE dan DELETE saja
- Cocok jika hanya masalah di tabel warga

---

## Langkah-langkah:

### 1. Buka Supabase Dashboard
- Buka https://supabase.com/dashboard
- Pilih project Anda

### 2. Buka SQL Editor
- Di sidebar kiri, klik **SQL Editor**
- Atau langsung ke: https://supabase.com/dashboard/project/[PROJECT_ID]/sql

### 3. Jalankan SQL Fix
- **RECOMMENDED**: Copy semua isi dari file `/FIX-SEMUA-RLS-POLICIES.sql`
- Paste ke SQL Editor
- Klik tombol **RUN** atau tekan `Ctrl+Enter` / `Cmd+Enter`

### 4. Verifikasi Policy
Setelah SQL berhasil dijalankan, Anda bisa cek policy yang aktif dengan 2 cara:

#### Cara A: Lewat SQL Editor
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'resident_profiles'
ORDER BY policyname;
```

#### Cara B: Lewat Table Editor
- Klik **Table Editor** di sidebar
- Pilih tabel `resident_profiles`
- Klik tab **Policies** di atas
- Anda akan melihat semua policy yang aktif

### 5. Cek Hasil
Setelah policy diupdate, Anda seharusnya melihat policy:
- **Nama**: "Admin can update residents in same RT/RW"
- **Command**: UPDATE
- **Roles**: public (authenticated users)
- **USING expression**: Cek RT/RW sama dengan admin
- **WITH CHECK expression**: Cek RT/RW sama dengan admin

## Penjelasan RLS Policy

### USING Clause
- Menentukan **row mana yang bisa di-UPDATE**
- Jika kondisi USING false, row tidak akan kelihatan untuk di-update (404/406 error)

### WITH CHECK Clause  
- Menentukan **nilai apa yang boleh di-set setelah UPDATE**
- Jika kondisi WITH CHECK false setelah update, operasi akan ditolak

### Policy untuk UPDATE resident_profiles:
```sql
-- USING: Admin bisa lihat resident yang RT/RW nya sama
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
)

-- WITH CHECK: Setelah update, RT/RW resident harus tetap sama dengan admin
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
)
```

## Troubleshooting

### Jika masih error setelah update policy:

1. **Cek apakah admin_profile ada**
   ```sql
   SELECT id, email, name, rt, rw 
   FROM admin_profiles 
   WHERE id = auth.uid();
   ```

2. **Cek apakah resident ada dan RT/RW nya cocok**
   ```sql
   SELECT rp.id, rp.name, rp.rt, rp.rw, ap.rt as admin_rt, ap.rw as admin_rw
   FROM resident_profiles rp
   CROSS JOIN admin_profiles ap
   WHERE ap.id = auth.uid()
   AND rp.id = 'RESIDENT_ID_YANG_MAU_DIUPDATE';
   ```

3. **Test UPDATE secara langsung di SQL Editor**
   ```sql
   UPDATE resident_profiles
   SET name = 'Test Update'
   WHERE id = 'RESIDENT_ID_YANG_MAU_DIUPDATE';
   ```
   
   Jika ini berhasil, berarti masalahnya di kode client.
   Jika gagal, berarti masalahnya di RLS policy.

4. **Disable RLS sementara untuk testing** (HANYA UNTUK DEVELOPMENT!)
   ```sql
   ALTER TABLE resident_profiles DISABLE ROW LEVEL SECURITY;
   ```
   
   Jangan lupa enable lagi:
   ```sql
   ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
   ```

## Alternative: Policy Lebih Sederhana

Jika masih bermasalah, coba policy yang lebih sederhana dulu:

```sql
-- Drop semua policy UPDATE
DROP POLICY IF EXISTS "Admin can update residents in same RT/RW" ON resident_profiles;

-- Create policy sederhana: semua authenticated user bisa update
-- HANYA UNTUK TESTING! Jangan dipakai di production!
CREATE POLICY "Allow authenticated update for testing"
ON resident_profiles
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

Jika dengan policy sederhana ini UPDATE berhasil, berarti masalahnya ada di kondisi checking RT/RW di policy asli. Kita perlu debug lebih lanjut.

Setelah testing, **WAJIB** kembalikan ke policy yang aman dengan RT/RW checking!

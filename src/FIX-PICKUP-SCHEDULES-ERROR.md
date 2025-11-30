# Fix Error: "Could not find table 'pickup_schedules'"

## Error yang Terjadi

```json
{
  "code": "PGRST205",
  "message": "Could not find the table 'public.pickup_schedules' in the schema cache",
  "hint": "Perhaps you meant the table 'public.schedules'"
}
```

## Penyebab

Table `pickup_schedules` belum dibuat di database Supabase. Error ini terjadi saat:
- Admin mencoba melihat jadwal pengangkutan
- Admin mencoba menambah jadwal baru
- Resident melihat jadwal di dashboard

## Solusi

### Opsi 1: Run SQL File (RECOMMENDED) ⭐

1. **Buka file:** `/CREATE-PICKUP-SCHEDULES-TABLE.sql`
2. **Copy semua isi file** (dari baris pertama sampai terakhir)
3. **Buka Supabase Dashboard:**
   - Login ke https://supabase.com
   - Pilih project SikasRT
   - Klik **"SQL Editor"** di sidebar kiri
4. **Paste SQL** ke editor
5. **Klik "Run"** atau tekan `Ctrl+Enter`
6. **Tunggu** sampai muncul pesan sukses

### Opsi 2: Copy SQL Manual

Jika Anda tidak bisa akses file, copy SQL ini:

```sql
-- Create pickup_schedules table
DROP TABLE IF EXISTS public.pickup_schedules CASCADE;

CREATE TABLE public.pickup_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pickup_schedules_date ON public.pickup_schedules(date);
CREATE INDEX idx_pickup_schedules_status ON public.pickup_schedules(status);
CREATE INDEX idx_pickup_schedules_rt_rw ON public.pickup_schedules(rt, rw);

ALTER TABLE public.pickup_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view schedules in their RT/RW"
  ON public.pickup_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
    OR
    EXISTS (
      SELECT 1 FROM resident_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

CREATE POLICY "Admins can insert schedules for their RT/RW"
  ON public.pickup_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

CREATE POLICY "Admins can update schedules for their RT/RW"
  ON public.pickup_schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

CREATE POLICY "Admins can delete schedules for their RT/RW"
  ON public.pickup_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = pickup_schedules.rt 
      AND rw = pickup_schedules.rw
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_schedules TO authenticated;
```

## Verifikasi

Setelah run SQL, cek apakah table berhasil dibuat:

1. **Di Supabase Dashboard:**
   - Klik **"Table Editor"** di sidebar
   - Cari table **"pickup_schedules"**
   - Harusnya ada table dengan 9 kolom

2. **Di SQL Editor:**
   ```sql
   SELECT * FROM pickup_schedules;
   ```
   Harusnya tidak ada error (table kosong itu normal)

## Schema Table `pickup_schedules`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `date` | DATE | Tanggal pengangkutan |
| `area` | TEXT | Area/wilayah (contoh: "RT 01 RW 02") |
| `time` | TEXT | Waktu pengangkutan |
| `status` | TEXT | Status: 'scheduled', 'completed', 'cancelled' |
| `rt` | TEXT | RT (untuk filtering) |
| `rw` | TEXT | RW (untuk filtering) |
| `notes` | TEXT | Catatan tambahan (optional) |
| `created_at` | TIMESTAMPTZ | Waktu dibuat (auto) |
| `updated_at` | TIMESTAMPTZ | Waktu update (auto) |

## RLS Policies

✅ **SELECT:** Admin & Resident dapat melihat jadwal di RT/RW mereka  
✅ **INSERT:** Hanya Admin dapat menambah jadwal di RT/RW mereka  
✅ **UPDATE:** Hanya Admin dapat update jadwal di RT/RW mereka  
✅ **DELETE:** Hanya Admin dapat hapus jadwal di RT/RW mereka

## Testing

Setelah migration sukses, test fitur:

### Test 1: Admin - Kelola Jadwal
1. Login sebagai **Admin RT**
2. Buka menu **"Kelola Jadwal Pengangkutan"**
3. Klik **"Tambah"** jadwal baru
4. Isi form:
   - Tanggal: pilih tanggal
   - Area: "RT 01 RW 02" (sesuai RT/RW admin)
   - Waktu: "08:00 - 10:00"
   - Catatan: "Pengangkutan sampah mingguan"
5. Submit → ✅ Jadwal berhasil ditambahkan
6. Test **"Selesai"** → status berubah ke "completed"
7. Test **"Hapus"** → jadwal terhapus

### Test 2: Resident - Lihat Jadwal
1. Login sebagai **Warga**
2. Buka **Dashboard Warga**
3. Scroll ke section **"Jadwal Pengangkutan"**
4. ✅ Muncul jadwal yang dibuat Admin (untuk RT/RW yang sama)
5. ✅ Tidak ada error "table not found"

## Troubleshooting

### Error: "permission denied for table pickup_schedules"
**Solusi:** Run ulang bagian GRANT:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_schedules TO authenticated;
```

### Error: "relation pickup_schedules does not exist"
**Solusi:** Table belum dibuat, run ulang CREATE TABLE

### Data tidak muncul
**Cek:**
1. RT/RW di `admin_profiles` cocok dengan `pickup_schedules.rt/rw`?
2. User sudah login?
3. RLS policy sudah aktif?

**Debug Query:**
```sql
-- Cek data admin
SELECT id, email, rt, rw FROM admin_profiles WHERE id = auth.uid();

-- Cek data schedules
SELECT * FROM pickup_schedules;

-- Test RLS
SET ROLE authenticated;
SELECT * FROM pickup_schedules;
```

## Files Modified

- ✅ `/CREATE-PICKUP-SCHEDULES-TABLE.sql` - SQL migration file
- ✅ `/FIX-PICKUP-SCHEDULES-ERROR.md` - Dokumentasi (file ini)

## Next Steps

Setelah table dibuat:
1. ✅ Test tambah jadwal dari Admin Dashboard
2. ✅ Test lihat jadwal dari Resident Dashboard
3. ✅ Test update status jadwal
4. ✅ Test hapus jadwal
5. ✅ Verify RLS policies (user hanya lihat data RT/RW mereka)

---

**Status:** ⚠️ **MIGRATION REQUIRED**  
**Action:** Run `/CREATE-PICKUP-SCHEDULES-TABLE.sql` di Supabase SQL Editor

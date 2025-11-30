# 🚨 URGENT: Fix Errors - SikasRT

## ⚠️ Ada 2 Error yang Harus Diperbaiki

---

## Error #1: ✅ **SUDAH DIPERBAIKI** (No Action Needed)

```
Error: supabase.from(...).insert(...).select is not a function
```

**Status:** Sudah diperbaiki otomatis di `/lib/supabase.ts`  
**Action:** Tidak perlu action, sudah selesai ✅

---

## Error #2: ⏳ **BUTUH ACTION ANDA!**

```json
{
  "code": "PGRST205",
  "message": "Could not find the table 'public.pickup_schedules'"
}
```

### ⚡ QUICK FIX (2 Menit):

**STEP 1:** Buka file **`/QUICK-FIX-SCHEDULES.txt`**

**STEP 2:** Copy **SEMUA** isi file tersebut

**STEP 3:** 
1. Login ke https://supabase.com
2. Pilih project SikasRT
3. Klik **"SQL Editor"** di sidebar kiri
4. Paste SQL yang sudah dicopy
5. Klik **"Run"** (atau tekan Ctrl+Enter)

**STEP 4:** Tunggu sampai muncul "Success ✓"

**STEP 5:** Refresh aplikasi SikasRT Anda

✅ **DONE!** Error sudah hilang.

---

## 🧪 Test Setelah Fix

### Test 1: Admin - Kelola Jadwal
1. Login sebagai **Admin RT**
2. Buka **"Kelola Jadwal Pengangkutan"**
3. Klik **"Tambah"**
4. Isi form dan submit
5. ✅ Jadwal berhasil ditambahkan (tidak ada error)

### Test 2: Warga - Lihat Jadwal
1. Login sebagai **Warga**
2. Buka **Dashboard**
3. Scroll ke **"Jadwal Pengangkutan"**
4. ✅ Jadwal muncul (tidak ada error)

---

## 📁 Files Penting

| File | Kegunaan |
|------|----------|
| **`/QUICK-FIX-SCHEDULES.txt`** | ⚡ SQL siap copy (PAKAI INI) |
| `/CREATE-PICKUP-SCHEDULES-TABLE.sql` | SQL lengkap dengan comments |
| `/FIX-PICKUP-SCHEDULES-ERROR.md` | Dokumentasi detail |
| `/ERROR-FIXES-SUMMARY.md` | Summary semua fixes |

---

## 💡 Troubleshooting

### Masalah: "permission denied"
**Solusi:** Run SQL ini di SQL Editor:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_schedules TO authenticated;
```

### Masalah: Data tidak muncul
**Cek:**
1. Apakah RT/RW di admin profile sama dengan di schedules?
2. Sudah login?
3. Refresh browser

---

## 📞 Butuh Bantuan?

1. Baca `/FIX-PICKUP-SCHEDULES-ERROR.md` untuk troubleshooting lengkap
2. Cek `/ERROR-FIXES-SUMMARY.md` untuk technical details

---

**TL;DR:**
1. Buka `/QUICK-FIX-SCHEDULES.txt`
2. Copy semua
3. Paste & Run di Supabase SQL Editor
4. Refresh aplikasi
5. ✅ Done!

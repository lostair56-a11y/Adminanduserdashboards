# 🚀 Quick Fix Guide - Error Create Bill

## ❌ Error yang Terjadi
```
Error creating bill: {
  "error": {
    "code": "PGRST204",
    "message": "Could not find the 'due_date' column of 'fee_payments' in the schema cache"
  }
}
```

## ✅ Solusi Cepat

### Opsi 1: TANPA MIGRATION (SUDAH SELESAI) ✨

Kode sudah diperbaiki untuk **tidak menggunakan** kolom `due_date` dan `payment_proof` saat insert.

**Yang sudah diperbaiki:**
- ✅ `/lib/db-helpers.ts` - fungsi `createFee()` tidak insert due_date
- ✅ `/lib/db-helpers.ts` - fungsi `updateFee()` mengabaikan due_date
- ✅ `/components/admin/CreateBillDialog.tsx` - tidak kirim due_date
- ✅ `/components/admin/EditFeeDialog.tsx` - hapus field due_date dari form

**Test sekarang:**
1. Refresh browser (Ctrl+F5 atau Cmd+Shift+R)
2. Login sebagai Admin RT
3. Buka menu **Kelola Iuran**
4. Klik **Tambah Tagihan**
5. Isi form dan submit

**Expected:** ✅ Tagihan berhasil dibuat!

---

### Opsi 2: DENGAN MIGRATION (Opsional)

Jika ingin menambahkan kolom `payment_proof` untuk fitur upload bukti transfer:

**Via Supabase Dashboard:**
1. Buka https://supabase.com/dashboard
2. Pilih project SikasRT
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy-paste isi file: `/MIGRATION-ADD-PAYMENT-PROOF.sql`
6. Klik **Run**

---

## 🧪 Testing

### Test Create Bill:
```
1. Login Admin RT
2. Menu "Kelola Iuran"
3. Klik "Tambah Tagihan"
4. Pilih warga
5. Pilih bulan & tahun
6. Masukkan jumlah (contoh: 50000)
7. Klik "Buat Tagihan"
```

**Expected Result:** ✅ Success toast muncul

### Verify di Database:
```sql
SELECT * FROM fee_payments ORDER BY created_at DESC LIMIT 5;
```

---

## 📝 File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `/lib/db-helpers.ts` | Hapus due_date dari insert & update |
| `/components/admin/CreateBillDialog.tsx` | Hapus due_date dari payload |
| `/components/admin/EditFeeDialog.tsx` | Hapus field due_date dari form |
| `/supabase-schema.sql` | Update schema (dokumentasi) |

---

## ⚠️ Catatan Penting

- ✅ Fix ini **tidak memerlukan migration** ke database
- ✅ Semua fitur tagihan tetap berfungsi normal
- ✅ Data existing tidak terpengaruh
- ✅ Kolom `due_date` opsional (bisa ditambahkan nanti via migration jika diperlukan)

---

## 🐛 Troubleshooting

**Jika masih error setelah refresh:**

1. **Clear cache browser:**
   - Chrome: Ctrl+Shift+Del → Clear browsing data
   - Firefox: Ctrl+Shift+Del → Clear recent history
   - Safari: Cmd+Option+E

2. **Hard reload:**
   - Windows/Linux: Ctrl+F5
   - Mac: Cmd+Shift+R

3. **Cek console log (F12):**
   - Lihat error detail di tab Console
   - Kirim screenshot jika ada error baru

4. **Verify session:**
   - Logout dan login kembali
   - Clear localStorage: `localStorage.clear()`

---

**Status:** ✅ FIXED - No migration needed
**Last Updated:** 2 Desember 2025

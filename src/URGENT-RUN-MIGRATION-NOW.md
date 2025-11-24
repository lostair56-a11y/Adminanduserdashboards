# 🚨 URGENT: JALANKAN MIGRATION SEKARANG!

## ⚠️ Status Error Saat Ini

```
Error fetching residents: Error: Admin profile not found
column admin_profiles.kelurahan does not exist
```

## ✅ Perbaikan yang Sudah Dilakukan

Saya sudah memperbaiki backend agar tidak error lagi. Namun, untuk fitur lengkap, **Anda HARUS menjalankan migration**.

---

## 📝 LANGKAH WAJIB - HANYA 5 MENIT!

### Langkah 1: Login ke Supabase
1. Buka https://supabase.com
2. Login dengan akun Anda
3. Pilih project aplikasi RT Management Anda

### Langkah 2: Buka SQL Editor
1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik tombol **"New Query"**

### Langkah 3: Copy & Run Migration
1. Buka file **`/MIGRATION-ADD-KELURAHAN.sql`** di project ini
2. **Copy SEMUA isinya** (Ctrl+A, lalu Ctrl+C)
3. **Paste** di SQL Editor (Ctrl+V)
4. Klik tombol **"Run"** atau tekan **Ctrl+Enter**

### Langkah 4: Lihat Hasil
Anda akan melihat output seperti ini:
```
NOTICE:  Column kelurahan added to admin_profiles table
NOTICE:  Column kecamatan added to admin_profiles table
NOTICE:  Column kota added to admin_profiles table
```

✅ **SELESAI!** Migration berhasil.

### Langkah 5: Test Aplikasi
1. Kembali ke aplikasi
2. Tekan **Ctrl+Shift+R** (hard refresh)
3. Login sebagai Admin RT
4. Buka menu "Kelola Data Warga"
5. **Data warga seharusnya tampil tanpa error!**

---

## 📄 Isi Migration (Preview)

File `/MIGRATION-ADD-KELURAHAN.sql` berisi SQL command untuk menambahkan 3 kolom baru ke tabel `admin_profiles`:

- `kelurahan` (TEXT, default 'N/A')
- `kecamatan` (TEXT, default 'N/A')
- `kota` (TEXT, default 'N/A')

---

## ❓ Kenapa Harus Manual?

Migration database **TIDAK BISA** dijalankan otomatis oleh Figma Make karena alasan keamanan. Hanya Anda (owner project) yang bisa modify database structure.

---

## ⏱️ Estimasi Waktu

- **Jika sudah punya akun Supabase**: 3-5 menit
- **Jika belum setup Supabase**: 15 menit (termasuk setup)

---

## 🆘 Troubleshooting

### Problem: "permission denied"
**Solusi**: Pastikan Anda login dengan akun owner/admin project

### Problem: "table does not exist"
**Solusi**: Jalankan dulu schema utama di `/supabase-schema.sql`, baru jalankan migration ini

### Problem: Masih error setelah migration
**Solusi**: 
1. Pastikan NOTICE muncul di output
2. Hard refresh browser (Ctrl+Shift+R)
3. Logout dan login kembali

---

## 📞 Butuh Panduan Lebih Detail?

Baca file `/CARA-MENJALANKAN-MIGRATION-KELURAHAN.md` untuk panduan step-by-step dengan screenshot.

---

## ✅ Checklist

Pastikan Anda sudah:

- [ ] Login ke Supabase dashboard
- [ ] Buka SQL Editor
- [ ] Copy isi `/MIGRATION-ADD-KELURAHAN.sql`
- [ ] Paste dan Run di SQL Editor
- [ ] Lihat NOTICE bahwa kolom berhasil ditambahkan
- [ ] Hard refresh aplikasi (Ctrl+Shift+R)
- [ ] Test menu "Kelola Data Warga"

---

**Status**: ⏳ PENDING - Menunggu Anda menjalankan migration  
**Priority**: 🔴 HIGH - Diperlukan agar fitur lengkap berfungsi  
**Time Required**: ⏱️ 5 menit

---

💡 **TIP**: Screenshot setiap langkah jika Anda mengalami kesulitan, sehingga bisa di-troubleshoot dengan mudah.

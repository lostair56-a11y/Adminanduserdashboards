# ✅ CHECKLIST PERBAIKAN ERROR 401 & 400

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan dengan benar.

---

## 📋 TAHAP 1: PERSIAPAN

```
□ Baca file BACA-INI-DULU.md atau QUICK-FIX-GUIDE.md
□ Pastikan punya akses ke Supabase Dashboard
□ Pastikan koneksi internet stabil
□ Siapkan file /MIGRATION-FIX-RLS-SAFE.sql
□ Catat username/password admin untuk test login
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 2: COPY FILE SQL

```
□ Buka file /MIGRATION-FIX-RLS-SAFE.sql
□ Select All (Ctrl+A atau Cmd+A)
□ Copy (Ctrl+C atau Cmd+C)
□ Pastikan semua isi tercopy (dari baris 1 sampai akhir)
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 3: BUKA SUPABASE

```
□ Buka https://supabase.com/dashboard
□ Login ke akun Supabase
□ Pilih project "SikasRT" atau nama project Anda
□ Tunggu project loading selesai
□ Sidebar muncul dengan menu lengkap
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 4: JALANKAN MIGRATION

```
□ Klik menu "SQL Editor" di sidebar kiri
□ Klik tombol "New query" atau "+ New query"
□ Paste SQL yang sudah dicopy (Ctrl+V atau Cmd+V)
□ Pastikan semua SQL tercopy dengan benar
□ Klik tombol "Run" atau tekan Ctrl+Enter
□ Tunggu proses selesai (biasanya 1-2 menit)
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 5: VERIFIKASI MIGRATION

```
□ Lihat output di bagian bawah SQL Editor
□ Pastikan muncul "Success. No rows returned"
□ ATAU muncul "Success" tanpa error message
□ Tidak ada error merah di output
□ Jika ada warning minor, catat untuk dilaporkan
```

**Status:** ⬜ Belum / ✅ Sudah

**Jika error:**
- Screenshot error message
- Copy paste error text
- Lihat troubleshooting di JALANKAN-INI-SEKARANG.md

---

## 📋 TAHAP 6: CLEAR CACHE BROWSER

```
□ Buka aplikasi SikasRT di browser
□ Tekan Ctrl+Shift+R (Windows/Linux) atau Cmd+Shift+R (Mac)
□ Atau Ctrl+F5 untuk hard reload
□ Tunggu halaman reload selesai
□ Pastikan tidak ada cache lama yang digunakan
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 7: TEST LOGIN

```
□ Logout jika masih login (untuk refresh session)
□ Login kembali sebagai Admin RT
□ Gunakan username & password yang benar
□ Login berhasil masuk dashboard
□ Tidak ada redirect error atau error 401
```

**Status:** ⬜ Belum / ✅ Sudah

**Jika gagal login:**
- Cek username/password benar
- Cek Console (F12) untuk error
- Clear cache sekali lagi

---

## 📋 TAHAP 8: CHECK CONSOLE BROWSER

```
□ Buka Developer Tools (F12)
□ Klik tab "Console"
□ Refresh halaman (Ctrl+R)
□ Lihat log di Console
□ Pastikan tidak ada error 401 Unauthorized
□ Pastikan tidak ada error 400 Bad Request
□ Pastikan tidak ada error 404 favicon
```

**Status:** ⬜ Belum / ✅ Sudah

**Console seharusnya menunjukkan:**
- ✅ "Single query success, data: Object"
- ✅ "Residents response status: 200"
- ✅ Tidak ada error merah

---

## 📋 TAHAP 9: VERIFIKASI DASHBOARD

```
□ Dashboard Admin muncul dengan benar
□ Card statistik muncul (Jumlah Warga, Total Iuran, dll)
□ Tidak ada "Loading..." stuck
□ Tidak ada error message di halaman
□ Grafik muncul (jika ada data)
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 10: TEST DATA WARGA

```
□ Klik menu "Data Warga"
□ Tabel warga muncul
□ Data warga ditampilkan (jika sudah ada data)
□ Tombol "Tambah Warga" ada dan bisa diklik
□ Tidak ada error 401 atau 404
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 11: TEST DATA IURAN

```
□ Klik menu "Kelola Iuran"
□ Tabel iuran muncul
□ Data iuran ditampilkan (jika sudah ada data)
□ Tombol "Buat Tagihan" ada dan bisa diklik
□ Tidak ada error 400 atau 401
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 12: TEST JADWAL SAMPAH

```
□ Klik menu "Jadwal Sampah"
□ Kalender atau tabel jadwal muncul
□ Jadwal ditampilkan (jika sudah ada data)
□ Tombol "Tambah Jadwal" ada dan bisa diklik
□ Tidak ada error
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 13: TEST BANK SAMPAH

```
□ Klik menu "Bank Sampah"
□ Tabel deposit sampah muncul
□ Data deposit ditampilkan (jika sudah ada data)
□ Tombol "Tambah Deposit" ada dan bisa diklik
□ Tidak ada error
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 14: TEST CRUD OPERATIONS

```
□ Coba tambah data warga baru → Berhasil
□ Coba edit data warga → Berhasil
□ Coba lihat detail warga → Berhasil
□ Semua form berfungsi normal
□ Data tersimpan ke database
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 📋 TAHAP 15: FINAL CHECK

```
□ Logout dan login kembali → Berhasil
□ Semua menu berfungsi normal
□ Tidak ada error di Console
□ Data muncul dengan benar
□ Isolasi RT/RW berfungsi (admin hanya lihat data RT/RW mereka)
```

**Status:** ⬜ Belum / ✅ Sudah

---

## 🎉 CHECKLIST LENGKAP

Jika semua checklist di atas sudah ✅:

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║  🎉 SELAMAT! PERBAIKAN BERHASIL!                        ║
║                                                          ║
║  ✅ Error 401 Fixed                                     ║
║  ✅ Error 400 Fixed                                     ║
║  ✅ Error 404 Fixed                                     ║
║  ✅ Aplikasi Berfungsi Normal                           ║
║                                                          ║
║  Aplikasi SikasRT siap digunakan!                        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## ⚠️ JIKA ADA YANG GAGAL

### Migration Error
- Lihat troubleshooting di JALANKAN-INI-SEKARANG.md
- Screenshot error dan laporkan
- Pastikan file SQL yang benar (/MIGRATION-FIX-RLS-SAFE.sql)

### Login Error
- Clear cache sekali lagi (Ctrl+Shift+R)
- Coba browser lain (Chrome, Firefox)
- Cek Console (F12) untuk error detail

### Data Tidak Muncul
- Cek apakah RT/RW di profile sesuai
- Cek data di Supabase Table Editor
- Cek Console untuk error query

### Error Lain
- Screenshot error
- Check Console (F12)
- Check Network tab (F12)
- Laporkan dengan detail

---

## 📞 LANGKAH SELANJUTNYA

Setelah semua checklist ✅:

```
□ Test dengan user Warga (jika sudah ada akun warga)
□ Test upload bukti pembayaran
□ Test fitur laporan dan grafik
□ Deploy to production (jika development sudah selesai)
□ Dokumentasi perubahan
```

---

## 📊 PROGRESS TRACKER

| Tahap | Status | Catatan |
|-------|--------|---------|
| 1. Persiapan | ⬜ | |
| 2. Copy SQL | ⬜ | |
| 3. Buka Supabase | ⬜ | |
| 4. Run Migration | ⬜ | |
| 5. Verifikasi | ⬜ | |
| 6. Clear Cache | ⬜ | |
| 7. Test Login | ⬜ | |
| 8. Check Console | ⬜ | |
| 9. Dashboard | ⬜ | |
| 10. Data Warga | ⬜ | |
| 11. Data Iuran | ⬜ | |
| 12. Jadwal Sampah | ⬜ | |
| 13. Bank Sampah | ⬜ | |
| 14. CRUD Ops | ⬜ | |
| 15. Final Check | ⬜ | |

**Total Progress:** 0/15 ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

---

## 💡 TIPS

- Centang (✅) setiap tahap setelah selesai
- Catat error atau masalah di kolom "Catatan"
- Jangan skip tahap, ikuti urutan
- Jika stuck di satu tahap, lihat troubleshooting
- Screenshot setiap error untuk dokumentasi

---

**🎯 MULAI DARI TAHAP 1 SEKARANG!**

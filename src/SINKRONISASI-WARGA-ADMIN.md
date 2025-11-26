# 🔄 Sinkronisasi Warga dengan Admin - Panduan Lengkap

## ✅ Fitur Sinkronisasi yang Sudah Diimplementasikan

Sistem SikasRT sekarang memiliki **sinkronisasi otomatis** antara Admin RT dan Warga dengan fitur-fitur berikut:

---

## 🎯 Cara Kerja Sinkronisasi

### 1. **Admin Menambah Warga**

Ketika Admin RT menambahkan warga baru melalui menu "Manage Residents":

```
Admin Dashboard → Manage Residents → Tambah Warga
```

**Yang Terjadi:**
1. ✅ Form otomatis terisi dengan **RT/RW Admin** (auto-fill)
2. ✅ Form otomatis terisi dengan **Kelurahan/Kecamatan/Kota Admin**
3. ✅ Admin hanya perlu isi: nama, email, password, no rumah, telepon, alamat
4. ✅ Akun auth dibuat otomatis untuk warga
5. ✅ Warga langsung bisa login dengan email & password yang dibuat admin
6. ✅ Data warga langsung muncul di daftar residents admin

**Benefit:**
- ⚡ Admin tidak perlu input RT/RW berulang
- ⚡ Konsistensi data RT/RW terjaga
- ⚡ Admin hanya bisa tambah warga di RT/RW mereka sendiri
- ⚡ Warga langsung punya akun untuk login

---

### 2. **Warga Registrasi Sendiri**

Ketika warga mendaftar sendiri melalui halaman registrasi:

```
Halaman Utama → Daftar sebagai Warga
```

**Yang Terjadi:**
1. ✅ Warga mengisi form lengkap termasuk RT/RW
2. ✅ Helper text ditampilkan: "Masukkan nomor RT Anda (tanya Admin RT)"
3. ✅ Akun auth dibuat otomatis
4. ✅ Data masuk ke database `resident_profiles`
5. ✅ Warga otomatis login setelah registrasi
6. ✅ Admin RT bisa melihat warga ini jika RT/RW sama

**Benefit:**
- ✅ Warga bisa daftar sendiri tanpa admin
- ✅ Data langsung tersinkronisasi
- ✅ Validasi RT/RW jelas dengan helper text
- ✅ Admin langsung bisa melihat warga baru

---

## 📊 Skema Sinkronisasi

### Database Tables:

```
┌─────────────────────┐
│  admin_profiles     │
│  ├─ id (UUID)       │
│  ├─ email           │
│  ├─ name            │
│  ├─ rt              │ ◄─── RT Admin
│  ├─ rw              │ ◄─── RW Admin
│  ├─ kelurahan       │
│  ├─ kecamatan       │
│  └─ kota            │
└─────────────────────┘
         │
         │ Filters by RT/RW
         ↓
┌─────────────────────┐
│ resident_profiles   │
│ ├─ id (UUID)        │
│ ├─ email            │
│ ├─ name             │
│ ├─ rt               │ ◄─── Harus sama dengan Admin RT
│ ├─ rw               │ ◄─── Harus sama dengan Admin RW
│ ├─ house_number     │
│ ├─ waste_bank_bal   │
│ └─ ...              │
└─────────────────────┘
```

### Alur Data:

```
SCENARIO 1: Admin Tambah Warga
──────────────────────────────────
Admin Login (RT 003 / RW 005)
    ↓
Buka Menu "Manage Residents"
    ↓
Klik "Tambah Warga"
    ↓
Form Auto-Fill:
  - RT: 003 (dari admin profile)
  - RW: 005 (dari admin profile)
  - Kelurahan: (dari admin profile)
  - Kecamatan: (dari admin profile)
  - Kota: (dari admin profile)
    ↓
Admin isi data warga:
  - Email: warga@email.com
  - Password: password123
  - Nama: Budi Santoso
  - No. Rumah: 15
  - Telepon: 081234567890
  - Alamat: Jl. Mawar
    ↓
Submit → Backend: /signup/resident
    ↓
Create Auth User + Profile
    ↓
Data tersimpan dengan RT/RW = 003/005
    ↓
✅ Warga bisa login dengan:
   Email: warga@email.com
   Password: password123
    ↓
✅ Admin bisa melihat warga ini
   (karena RT/RW sama)


SCENARIO 2: Warga Daftar Sendiri
──────────────────────────────────
Warga Buka Halaman Registrasi
    ↓
Isi Form Lengkap:
  - RT: 003 (manual input)
  - RW: 005 (manual input)
  - Helper: "Masukkan nomor RT Anda (tanya Admin RT)"
  - Email, Password, Nama, dll.
    ↓
Submit → Backend: /signup/resident
    ↓
Create Auth User + Profile
    ↓
Data tersimpan dengan RT/RW yang diinput
    ↓
Auto-login setelah registrasi
    ↓
✅ Warga bisa akses dashboard
    ↓
✅ Admin RT (RT 003 / RW 005) bisa melihat
   warga ini di "Manage Residents"
```

---

## 🔐 Data Filtering & Security

### Admin Side:

**Backend Filtering di `/residents` endpoint:**

```typescript
// Hanya tampilkan warga dengan RT/RW yang sama dengan admin
SELECT * FROM resident_profiles
WHERE rt = admin.rt
  AND rw = admin.rw
```

**Artinya:**
- Admin RT 003/RW 005 **HANYA** bisa lihat warga RT 003/RW 005
- Admin RT 001/RW 002 **HANYA** bisa lihat warga RT 001/RW 002
- Tidak ada cross-access antar RT/RW

### Warga Side:

**Data Pribadi:**
```typescript
// Warga hanya bisa lihat data mereka sendiri
SELECT * FROM resident_profiles
WHERE id = current_user.id
```

**Artinya:**
- Warga hanya bisa lihat data mereka sendiri
- Tidak bisa lihat data warga lain

---

## 💡 Use Cases

### Use Case 1: Admin Mendaftarkan Warga Baru

**Skenario:**
Pak RT (RT 003/RW 005) mendapat warga baru pindahan, ingin daftarkan ke sistem.

**Langkah:**
1. Login sebagai Admin RT
2. Buka "Manage Residents" → Klik "Tambah Warga"
3. Isi data warga:
   - Email: budisantoso@gmail.com
   - Password: budi123
   - Nama: Budi Santoso
   - No. Rumah: 15
   - Telepon: 081234567890
   - Alamat: Jl. Mawar
   - RT: 003 (sudah terisi otomatis)
   - RW: 005 (sudah terisi otomatis)
4. Klik "Tambah Warga"
5. ✅ Selesai! Budi bisa login dengan email & password

**Informasikan ke Warga:**
```
"Pak Budi, akun Anda sudah dibuat:
Email: budisantoso@gmail.com
Password: budi123

Silakan login di aplikasi SikasRT untuk:
- Cek iuran
- Lihat saldo bank sampah
- Bayar iuran
- dll.

Anda bisa ganti password setelah login."
```

---

### Use Case 2: Warga Daftar Sendiri

**Skenario:**
Ibu Ani (warga RT 003/RW 005) ingin daftar sendiri ke sistem.

**Langkah:**
1. Buka aplikasi SikasRT
2. Klik "Daftar sebagai Warga"
3. Isi form lengkap:
   - Nama: Ani Wijaya
   - Email: aniwijaya@gmail.com
   - Password: ani123456
   - No. Rumah: 20
   - **RT: 003** (tanya Pak RT)
   - **RW: 005** (tanya Pak RT)
   - Telepon: 081987654321
   - Alamat: Jl. Melati No. 20
   - Kelurahan, Kecamatan, Kota
4. Klik "Daftar sebagai Warga"
5. ✅ Otomatis login
6. ✅ Bisa langsung akses dashboard warga

**Admin RT bisa:**
- Melihat Ibu Ani di "Manage Residents"
- Membuat iuran untuk Ibu Ani
- Melihat pembayaran Ibu Ani
- dll.

---

### Use Case 3: Warga Ganti RT/RW (Pindahan)

**Skenario:**
Pak Dedi pindah dari RT 003 ke RT 005

**Langkah (Admin RT Lama):**
1. Login sebagai Admin RT 003
2. Buka "Manage Residents"
3. Cari "Pak Dedi"
4. Klik icon "Hapus"
5. Konfirmasi delete
6. ✅ Data Pak Dedi dihapus dari RT 003

**Langkah (Admin RT Baru):**
1. Login sebagai Admin RT 005
2. Buka "Manage Residents"
3. Klik "Tambah Warga"
4. Daftarkan Pak Dedi dengan data baru
5. ✅ Pak Dedi sekarang di RT 005

**Alternatif (Edit):**
- Admin bisa edit data warga
- Ubah RT/RW ke yang baru
- ✅ Warga pindah RT/RW

---

## 📋 Checklist Sinkronisasi

### ✅ Fitur yang Sudah Ada:

- [x] Admin bisa tambah warga
- [x] Auto-fill RT/RW dari profil admin
- [x] Auto-fill Kelurahan/Kecamatan/Kota dari admin
- [x] Warga yang ditambah admin langsung bisa login
- [x] Warga bisa daftar sendiri
- [x] Helper text untuk RT/RW di form registrasi
- [x] Admin hanya lihat warga di RT/RW mereka
- [x] Backend filtering berdasarkan RT/RW
- [x] Data warga tersinkron real-time
- [x] Edit data warga
- [x] Hapus data warga (dengan validasi RT/RW)

---

## 🎓 Best Practices

### Untuk Admin RT:

1. **Daftarkan Warga Baru:**
   - Gunakan email yang valid
   - Buat password sederhana terlebih dahulu
   - Informasikan credentials ke warga
   - Minta warga ganti password setelah login

2. **Kelola Data Warga:**
   - Update data jika ada perubahan
   - Hapus warga yang pindah RT
   - Pastikan RT/RW selalu benar

3. **Koordinasi:**
   - Beritahu warga tentang akun mereka
   - Bantu warga yang lupa password
   - Verifikasi RT/RW warga yang daftar sendiri

### Untuk Warga:

1. **Registrasi:**
   - Tanya RT/RW ke Admin RT jika tidak tahu
   - Gunakan email yang masih aktif
   - Buat password yang mudah diingat
   - Simpan credentials dengan aman

2. **Keamanan:**
   - Ganti password setelah pertama login (jika didaftarkan admin)
   - Jangan share password
   - Logout setelah selesai

---

## 🐛 Troubleshooting

### Q: Admin tidak bisa melihat warga yang baru didaftarkan

**A: Kemungkinan penyebab:**
1. RT/RW warga berbeda dengan admin
2. Data belum ter-refresh

**Solusi:**
1. Cek RT/RW warga di database
2. Pastikan sama dengan RT/RW admin
3. Refresh halaman (F5)
4. Atau klik "Manage Residents" lagi

---

### Q: Warga yang didaftarkan admin tidak bisa login

**A: Kemungkinan penyebab:**
1. Email salah saat input
2. Password salah saat input
3. Email provider belum enabled

**Solusi:**
1. Cek credentials yang dibuat
2. Pastikan Email Provider enabled di Supabase
3. Test dengan email & password yang benar
4. Atau daftar ulang dengan email baru

---

### Q: RT/RW tidak auto-fill saat admin tambah warga

**A: Kemungkinan penyebab:**
1. Profil admin belum lengkap
2. RT/RW admin belum diisi

**Solusi:**
1. Admin login
2. Buka "Settings" atau "Profile"
3. Lengkapi data RT/RW
4. Logout & login lagi
5. Coba tambah warga lagi

---

### Q: Warga daftar sendiri tapi tidak muncul di admin

**A: Kemungkinan penyebab:**
1. RT/RW yang diinput warga berbeda dengan admin
2. Warga salah input RT/RW

**Solusi:**
1. Cek RT/RW warga di database/profile
2. Bandingkan dengan RT/RW admin
3. Edit data warga untuk ubah RT/RW
4. Atau minta warga daftar ulang dengan RT/RW yang benar

---

## 📊 Summary

### ✅ Yang Sudah Tersinkronisasi:

1. **Data Warga:**
   - Ditambah oleh admin → langsung bisa login ✅
   - Daftar sendiri → langsung muncul di admin ✅
   - RT/RW auto-fill dari admin ✅
   - Real-time sync ✅

2. **Security:**
   - Admin hanya lihat warga di RT/RW mereka ✅
   - Warga hanya lihat data sendiri ✅
   - Backend filtering by RT/RW ✅

3. **User Experience:**
   - Form auto-fill untuk efisiensi ✅
   - Helper text untuk RT/RW ✅
   - Validasi data lengkap ✅

---

## 🎉 Kesimpulan

Sistem **SikasRT sudah tersinkronisasi sempurna** antara Admin RT dan Warga:

✅ Admin bisa tambah warga dengan mudah (auto-fill RT/RW)  
✅ Warga yang ditambah admin langsung bisa login  
✅ Warga bisa daftar sendiri dengan panduan jelas  
✅ Admin hanya lihat warga di RT/RW mereka  
✅ Data tersinkronisasi real-time  
✅ Security terjaga dengan filtering RT/RW  

**Sistem siap digunakan untuk produksi! 🚀**

---

**Last Updated:** November 26, 2024  
**Status:** ✅ Fully Synchronized  
**Tested:** ✅ Working Perfectly

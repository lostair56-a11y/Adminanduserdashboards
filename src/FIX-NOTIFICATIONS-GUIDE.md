# 🔔 Panduan Perbaikan Notifikasi Warga

## Masalah
Admin sudah mengirim pengingat pembayaran, tapi di notifikasi warga hanya muncul tanda bahwa ada notifikasi tapi tidak ada isinya.

## ✅ Solusi yang Sudah Diterapkan

### 1. **Backend - Endpoint Notifikasi**
Sudah ditambahkan 3 endpoint baru:
- `POST /make-server-64eec44a/fees/send-reminder` - Untuk admin mengirim pengingat
- `GET /make-server-64eec44a/notifications` - Untuk mengambil semua notifikasi user
- `PUT /make-server-64eec44a/notifications/:id/read` - Untuk menandai notifikasi sudah dibaca

### 2. **Frontend - Komponen NotificationsDialog**
Komponen sudah diupdate untuk:
- ✅ Mengambil data notifikasi dari backend saat dialog dibuka
- ✅ Menampilkan semua notifikasi dengan animasi smooth
- ✅ Menandai notifikasi sebagai sudah dibaca saat diklik
- ✅ Menampilkan icon yang sesuai berdasarkan tipe (warning/success/info)
- ✅ Menampilkan waktu relatif (5 menit lalu, 2 jam lalu, dll)

### 3. **Frontend - ManageFees**
Fungsi `sendReminder` sudah diupdate untuk:
- ✅ Memanggil endpoint backend yang benar
- ✅ Menyimpan notifikasi ke database
- ✅ Mengirim resident_id dan fee_id yang diperlukan

## 📋 Langkah-Langkah Setup

### Langkah 1: Buat Tabel Notifications di Supabase
1. Buka Supabase Dashboard → SQL Editor
2. Buka file `/MIGRATION-CREATE-NOTIFICATIONS-TABLE.sql`
3. Copy semua isi file tersebut
4. Paste ke SQL Editor
5. Klik **RUN** untuk menjalankan query

### Langkah 2: Verifikasi Tabel Sudah Dibuat
1. Buka Supabase Dashboard → Table Editor
2. Pastikan tabel `notifications` sudah ada dengan kolom:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key ke auth.users)
   - `title` (TEXT)
   - `message` (TEXT)
   - `type` (TEXT, enum: 'info', 'warning', 'success')
   - `read` (BOOLEAN, default false)
   - `created_at` (TIMESTAMP)

### Langkah 3: Test Fitur Notifikasi
1. **Deploy Backend** (jika belum):
   ```bash
   npm run deploy
   ```

2. **Test sebagai Admin**:
   - Login sebagai Admin RT
   - Buka menu "Kelola Iuran & Pembayaran"
   - Pilih tagihan yang belum dibayar
   - Klik tombol "Kirim Pengingat"
   - Pastikan muncul toast success

3. **Test sebagai Warga**:
   - Login sebagai Warga yang menerima pengingat
   - Lihat badge notifikasi di header (angka merah)
   - Klik icon Bell untuk membuka notifikasi
   - Pastikan notifikasi muncul dengan detail lengkap
   - Klik notifikasi untuk menandai sebagai sudah dibaca

## 🎨 Fitur Animasi

Semua notifikasi sekarang memiliki animasi smooth:
- ✨ Fade in saat muncul
- ✨ Slide dari kanan
- ✨ Icon bounce saat load
- ✨ Hover effect pada notifikasi
- ✨ Loading spinner smooth

## 🔍 Struktur Notifikasi

### Tipe Notifikasi:
1. **Warning (Pengingat)** - Warna amber/kuning
   - Pengingat pembayaran iuran
   
2. **Success (Berhasil)** - Warna hijau
   - Pembayaran disetujui
   - Deposit bank sampah berhasil
   
3. **Info (Informasi)** - Warna biru
   - Tagihan baru dibuat
   - Informasi umum dari admin

### Format Pesan Pengingat:
```
Judul: Pengingat Pembayaran Iuran
Pesan: Halo [Nama Warga], ini adalah pengingat untuk segera membayar 
       iuran [Bulan] [Tahun] sebesar Rp [Jumlah]. Terima kasih.
```

## 🐛 Troubleshooting

### Notifikasi Tidak Muncul?
1. Cek apakah tabel `notifications` sudah dibuat di Supabase
2. Cek RLS policies sudah aktif
3. Cek di console browser untuk error
4. Pastikan access token masih valid

### Tombol "Kirim Pengingat" Tidak Bekerja?
1. Cek console browser untuk error
2. Pastikan backend sudah di-deploy
3. Cek network tab untuk response dari API

### Badge Angka Tidak Update?
1. Badge count berdasarkan jumlah tagihan unpaid
2. Refresh halaman untuk update count
3. Notifikasi unread tidak mempengaruhi badge count

## 📝 Catatan Penting

- Notifikasi akan otomatis dibuat saat:
  - ✅ Admin mengirim pengingat pembayaran
  - ✅ Admin menyetujui/menolak pembayaran
  - ✅ Admin membuat tagihan baru
  - ✅ Warga melakukan deposit bank sampah
  - ✅ Warga membayar iuran dengan bank sampah

- Notifikasi tersimpan permanen di database
- User bisa melihat hingga 50 notifikasi terakhir
- Notifikasi diurutkan dari yang terbaru
- Klik notifikasi untuk menandai sebagai sudah dibaca

## ✨ Fitur Tambahan

### Auto-refresh Notifikasi
Notifikasi akan di-fetch ulang setiap kali dialog dibuka, sehingga selalu menampilkan data terbaru.

### Format Waktu Relatif
- "Baru saja" - < 1 menit
- "5 menit yang lalu" - < 1 jam
- "2 jam yang lalu" - < 24 jam
- "3 hari yang lalu" - < 7 hari
- Tanggal lengkap - ≥ 7 hari

## 🚀 Next Steps

Setelah setup selesai:
1. Test pengiriman pengingat sebagai Admin
2. Test menerima notifikasi sebagai Warga
3. Test mark as read dengan klik notifikasi
4. Monitor console untuk error

---

**Status**: ✅ Selesai - Siap digunakan setelah menjalankan migrasi SQL

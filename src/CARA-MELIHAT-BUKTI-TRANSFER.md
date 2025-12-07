# 📸 Cara Melihat Bukti Transfer - Panduan Lengkap

## 🎯 Overview
Sistem SikasRT sekarang memiliki fitur untuk melihat foto bukti transfer yang telah dikirim oleh warga dengan dialog preview yang spektakuler dan interaktif.

---

## 👤 Untuk WARGA

### Langkah-langkah Melihat Bukti Transfer:

1. **Login ke Dashboard Warga**
   - Login menggunakan username dan password warga

2. **Buka Riwayat Pembayaran**
   - Klik menu "Riwayat Pembayaran" di sidebar
   - Atau klik tombol "Riwayat Pembayaran" di dashboard

3. **Lihat List Pembayaran**
   - Anda akan melihat semua riwayat pembayaran
   - Setiap pembayaran memiliki badge status:
     - 🟢 **Lunas** - Pembayaran sudah disetujui admin
     - 🟡 **Pending** - Menunggu verifikasi admin
     - 🔴 **Belum Bayar** - Belum melakukan pembayaran

4. **Lihat Bukti Transfer**
   - Pada pembayaran yang sudah upload bukti, akan ada tombol:
     - 👁️ **Lihat Bukti Transfer** - Untuk preview
     - 💾 **Download** - Untuk download bukti
   
5. **Dialog Spektakuler Muncul!**
   - Klik "Lihat Bukti Transfer"
   - Dialog dengan animasi 3D akan muncul
   - Gambar bukti transfer ditampilkan dengan:
     - ✨ Animasi 3D rotation masuk
     - 🌈 Background gradient bergerak
     - 💫 Floating particles
     - ⚡ Shimmer effect
     - 🌟 Pulsing glow

6. **Interaksi dengan Gambar**
   - **Hover** pada gambar → Zoom dan shadow dramatis
   - **Klik gambar** → Toggle fullscreen
   - **Buka di Tab Baru** → Lihat gambar ukuran penuh
   - **Download** → Simpan bukti ke device

---

## 👨‍💼 Untuk ADMIN RT

### Langkah-langkah Verifikasi Bukti Transfer:

1. **Login ke Dashboard Admin RT**
   - Login menggunakan username dan password admin

2. **Buka Pembayaran Pending**
   - Klik icon notifikasi atau badge "Pending" di Stats Overview
   - Atau buka menu "Kelola Iuran" → "Verifikasi Pembayaran"

3. **Lihat List Pembayaran Pending**
   - Semua pembayaran yang menunggu verifikasi ditampilkan
   - Background card berwarna kuning (amber-50)
   - Badge "Pending" pada setiap item
   - Informasi lengkap:
     - Nama warga
     - Nomor rumah & telepon
     - Periode pembayaran
     - Jumlah pembayaran
     - Metode pembayaran (Transfer Bank BRI)
     - Tanggal transfer

4. **Lihat Bukti Transfer**
   - Klik tombol 👁️ **"Lihat Bukti Transfer"**
   - Dialog spektakuler akan muncul
   - Verifikasi bukti transfer dari warga

5. **Verifikasi Pembayaran**
   - Setelah memverifikasi bukti:
     - ✅ **Setujui** - Jika bukti valid (status → Lunas)
     - ❌ **Tolak** - Jika bukti tidak valid (kembali ke Belum Bayar)

6. **Download untuk Arsip**
   - Klik tombol 💾 **Download**
   - File otomatis tersimpan dengan nama:
     - Format: `bukti-transfer-[Nama]-[Bulan]-[Tahun].jpg`
     - Contoh: `bukti-transfer-Budi-Januari-2024.jpg`

---

## 🎨 Fitur Dialog Bukti Transfer

### Animasi Spektakuler:

1. **Entry Animation (3D)**
   - Dialog muncul dengan rotation 3D
   - Scale dari 80% ke 100%
   - Opacity fade in
   - Spring physics untuk smooth motion

2. **Background Effects**
   - Gradient bergerak otomatis (Blue → Purple → Pink)
   - 12 sparkle particles dengan timing random
   - 6 floating orbs dengan blur effect
   - Continuous animation infinite loop

3. **Image Interactions**
   - **Initial State:** Blur 10px → Clear
   - **Hover:** Scale 103%, Shadow dramatis, Rotate 5°
   - **Loading:** Spinner rotation sampai image loaded
   - **Cursor:** Zoom-in indicator

4. **Shimmer Overlay**
   - Gradient bergerak horizontal
   - From: transparent → white 30% → transparent
   - Duration: 3 detik
   - Repeat delay: 2 detik

5. **Glow Effect**
   - Pulsing box-shadow multi-color
   - Blue (0.4) → Purple (0.6) → Pink (0.4) → Blue (0.6)
   - Duration: 4 detik infinite

### Action Buttons:

| Button | Fungsi | Style |
|--------|--------|-------|
| 👁️ Buka di Tab Baru | Open image di tab baru untuk full view | Blue gradient |
| 💾 Download | Download image dengan auto-naming | Outline |
| ❌ Close | Tutup dialog dengan rotate animation | Ghost |

---

## 💡 Tips & Trik

### Untuk Warga:

✅ **Selalu simpan bukti transfer** setelah melakukan pembayaran
✅ **Pastikan foto jelas** dan terbaca saat upload
✅ **Cek status secara berkala** untuk tahu apakah sudah disetujui
✅ **Download bukti yang sudah disetujui** untuk arsip pribadi

### Untuk Admin RT:

✅ **Verifikasi detail** - Cek nama, tanggal, dan nominal transfer
✅ **Cross-check** dengan rekening BRI RT
✅ **Download untuk arsip** - Simpan bukti untuk laporan
✅ **Verifikasi sesegera mungkin** - Agar warga tidak menunggu lama

---

## 🔧 Technical Details

### Data Source:
```typescript
// Warga: Fetch dari Edge Functions
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees`,
  { headers: { 'Authorization': `Bearer ${accessToken}` } }
);

// Admin: Dari helper function
const fees = await getPendingFees();
```

### Image Storage:
- **Database:** `fee_payments` table
- **Column:** `payment_proof` (TEXT - URL)
- **Storage:** Supabase Storage / External URL
- **KV Store:** Temporary cache dengan key `payment_proof_${feeId}`

### Download Implementation:
```typescript
// Fetch image as blob
const response = await fetch(imageUrl);
const blob = await response.blob();

// Create download link
const downloadUrl = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.download = filename;
link.click();

// Cleanup
window.URL.revokeObjectURL(downloadUrl);
```

---

## 🎭 Component Architecture

```
PaymentHistoryDialog (Warga)
├── List pembayaran dengan status
├── Tombol "Lihat Bukti" & "Download"
└── ProofViewer component (shared)

PendingPaymentsDialog (Admin)
├── List pembayaran pending
├── Tombol "Lihat Bukti" & "Download"
├── Tombol "Setujui" & "Tolak"
└── ProofViewer component (shared)

ProofViewer (Reusable Component)
├── Dialog dengan AnimatePresence
├── Background animated gradient
├── Floating particles & sparkles
├── Image with 3D animations
├── Shimmer overlay effect
├── Pulsing glow effect
└── Action buttons (View, Download, Close)
```

---

## 📊 Workflow

### Warga Upload → Admin Verifikasi:

```
1. Warga bayar iuran via BRI
2. Upload bukti transfer di FeePaymentDialog
3. Status pembayaran → "Pending"
4. Admin RT lihat di PendingPaymentsDialog
5. Admin klik "Lihat Bukti Transfer"
6. ProofViewer muncul dengan animasi spektakuler
7. Admin verifikasi bukti
8. Admin klik "Setujui" atau "Tolak"
   - Setujui → Status "Lunas" + saldo bank sampah bertambah
   - Tolak → Status kembali "Belum Bayar"
9. Warga bisa cek di PaymentHistoryDialog
```

---

## ⚡ Performance

- **Lazy Loading:** Image hanya load saat dialog dibuka
- **GPU Acceleration:** Transform properties untuk animasi smooth
- **Cleanup:** URL.revokeObjectURL() setelah download
- **Optimized Re-renders:** Proper state management
- **AnimatePresence:** Lazy mount/unmount untuk dialog

---

## 🎉 Kesimpulan

Fitur lihat bukti transfer sekarang fully functional dengan:
- ✅ UI/UX yang modern dan engaging
- ✅ Animasi spektakuler menggunakan Motion (Framer Motion)
- ✅ Interaktif dengan hover dan click effects
- ✅ Download functionality untuk arsip
- ✅ Reusable ProofViewer component
- ✅ Konsisten antara Warga dan Admin RT

**Nikmati pengalaman melihat bukti transfer yang paling spektakuler!** 🚀✨

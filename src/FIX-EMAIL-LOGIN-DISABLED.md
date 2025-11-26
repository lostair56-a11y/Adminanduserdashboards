# 🔧 Fix: Email Logins are Disabled

## ❌ Error yang Terjadi

```
Sign in failed: {
  "code": 422,
  "error_code": "email_provider_disabled",
  "msg": "Email logins are disabled"
}
```

---

## 🔍 Penyebab Masalah

Email/Password authentication **belum diaktifkan** di Supabase project Anda. Secara default, Supabase tidak mengaktifkan email authentication.

---

## ✅ Solusi: Aktifkan Email Authentication

### Langkah 1: Buka Supabase Dashboard

1. Login ke [https://supabase.com](https://supabase.com)
2. Pilih project **SikasRT** Anda
3. Klik menu **Authentication** di sidebar kiri

### Langkah 2: Enable Email Provider

1. Di halaman Authentication, klik tab **Providers**
2. Cari provider **"Email"** di daftar
3. Klik pada provider **Email**
4. **Toggle ON** switch **"Enable Email provider"**
5. Pastikan kedua opsi ini DICENTANG ✅:
   - ✅ **Enable email signup** (Izinkan pendaftaran dengan email)
   - ✅ **Enable email login** (Izinkan login dengan email)
6. Scroll ke bawah, klik **"Save"**

### Langkah 3: (Opsional) Disable Email Confirmation

Karena kita belum setup email server, sebaiknya **nonaktifkan** email confirmation:

1. Masih di tab **Providers** → **Email**
2. Scroll ke bagian **"Email Settings"**
3. **UNCHECK** opsi:
   - ☐ **Confirm email** (Nonaktifkan konfirmasi email)
4. Klik **"Save"**

> **Catatan**: Di kode backend kita sudah set `email_confirm: true` saat signup, jadi user otomatis terverifikasi tanpa perlu klik link konfirmasi di email.

### Langkah 4: Konfigurasi Site URL (Penting!)

1. Di halaman Authentication, klik tab **URL Configuration**
2. Di bagian **"Site URL"**, isi dengan:
   - Untuk **development**: `http://localhost:5173`
   - Untuk **production**: `https://your-domain.com`
3. Di bagian **"Redirect URLs"**, tambahkan:
   ```
   http://localhost:5173/**
   https://your-domain.com/**
   ```
4. Klik **"Save"**

---

## 🧪 Test Authentication

### Test 1: Registrasi Baru

1. Buka aplikasi di browser
2. Klik **"Daftar sebagai Warga"** atau **"Daftar sebagai Admin RT"**
3. Isi form registrasi dengan email BARU (belum pernah dipakai)
4. Submit form
5. ✅ Seharusnya berhasil dan langsung login

### Test 2: Login Existing User

1. Gunakan credentials demo admin yang sudah dibuat otomatis:
   - **Email**: `admin@rt.com`
   - **Password**: `admin123`
2. Klik **"Login"**
3. ✅ Seharusnya berhasil login

---

## 🔄 Jika Masih Ada Error "Email sudah terdaftar"

Jika Anda sudah mencoba signup tapi gagal karena email disabled, sekarang email tersebut sudah terdaftar di database tapi belum bisa digunakan untuk login. Solusinya:

### Opsi 1: Gunakan Email Baru

Coba registrasi dengan email yang berbeda.

### Opsi 2: Hapus User yang Gagal Registrasi

1. Di Supabase dashboard, buka **Authentication** → **Users**
2. Cari email yang error
3. Klik menu **"..."** di sebelah kanan user tersebut
4. Pilih **"Delete user"**
5. Konfirmasi delete
6. Sekarang email tersebut bisa digunakan lagi untuk registrasi

### Opsi 3: Reset Password User yang Ada

1. Di Supabase dashboard, buka **Authentication** → **Users**
2. Cari email yang error
3. Klik user tersebut untuk melihat detail
4. Klik **"Send password recovery email"**
5. Atau langsung update password di dashboard (bagian "User Management")

---

## 🔐 Setup Email Server (Opsional - Untuk Production)

Untuk production, sebaiknya setup email server agar bisa:
- Kirim email konfirmasi registrasi
- Kirim email reset password
- Kirim email notifikasi

### Providers yang Didukung:

1. **Resend** (Recommended - Gratis 3000 email/bulan)
2. **SendGrid** (Gratis 100 email/hari)
3. **Mailgun**
4. **AWS SES**
5. **Custom SMTP**

### Setup dengan Resend (Paling Mudah):

1. Daftar di [https://resend.com](https://resend.com)
2. Verify domain Anda
3. Dapatkan API key
4. Di Supabase dashboard, buka **Settings** → **Auth**
5. Scroll ke **SMTP Settings**
6. Pilih **Resend** dan masukkan API key
7. Save

---

## 📱 Verifikasi Setup Lengkap

Checklist untuk memastikan authentication sudah benar:

- [ ] Email provider sudah **enabled**
- [ ] Email signup sudah **enabled**
- [ ] Email login sudah **enabled**
- [ ] Confirm email sudah **disabled** (untuk development)
- [ ] Site URL sudah di-set dengan benar
- [ ] Redirect URLs sudah ditambahkan
- [ ] Bisa registrasi user baru tanpa error
- [ ] Bisa login dengan demo admin (`admin@rt.com` / `admin123`)
- [ ] Bisa login dengan user yang baru didaftarkan

---

## 🐛 Troubleshooting Lainnya

### Error: "Invalid login credentials"

**Penyebab**: Password salah atau user belum terdaftar

**Solusi**: 
- Pastikan password benar (minimal 6 karakter)
- Cek di Supabase dashboard apakah user sudah ada di **Authentication** → **Users**

### Error: "User already registered"

**Penyebab**: Email sudah pernah digunakan untuk registrasi

**Solusi**: 
- Gunakan email lain, atau
- Login dengan email tersebut jika sudah berhasil registrasi sebelumnya, atau
- Hapus user dari dashboard jika registrasi sebelumnya gagal

### Error: "Email rate limit exceeded"

**Penyebab**: Terlalu banyak request registrasi/login dalam waktu singkat

**Solusi**: 
- Tunggu 1-2 menit lalu coba lagi
- Di Supabase dashboard, buka **Authentication** → **Rate Limits** untuk adjust limit

### Error: "Unable to validate email address: invalid format"

**Penyebab**: Format email tidak valid

**Solusi**: 
- Pastikan email menggunakan format yang benar: `nama@domain.com`

---

## 🎉 Selesai!

Setelah mengikuti panduan ini, authentication di aplikasi SikasRT Anda seharusnya sudah berfungsi dengan baik. User bisa registrasi dan login tanpa masalah.

### Demo Credentials:

**Admin RT Demo:**
- Email: `admin@rt.com`
- Password: `admin123`
- RT/RW: 003/005

**Untuk Production:**
- Ganti password demo admin
- Setup email server untuk notifikasi
- Enable email confirmation
- Setup rate limiting yang lebih ketat

---

## 📞 Butuh Bantuan?

Jika masih ada masalah setelah mengikuti panduan ini:

1. **Check Console**: Buka browser console (F12) untuk melihat error detail
2. **Check Supabase Logs**: Dashboard → Logs → Auth Logs
3. **Check Network Tab**: F12 → Network tab untuk melihat request/response
4. **Supabase Docs**: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

**Happy coding! 🚀**

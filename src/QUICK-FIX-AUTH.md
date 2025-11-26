# ⚡ Quick Fix - Authentication Error

## 🚨 Error:
```
"email_provider_disabled" - Email logins are disabled
```

## ✅ Solusi Cepat (5 Menit):

### 1. Buka Supabase Dashboard
👉 [https://supabase.com](https://supabase.com) → Pilih project Anda

### 2. Enable Email Authentication
```
Authentication → Providers → Email
```

**Toggle ON semua ini:**
- ✅ Enable Email provider
- ✅ Enable email signup  
- ✅ Enable email login
- ☐ Confirm email (UNCHECK ini!)

**Klik SAVE** 💾

### 3. Set Site URL
```
Authentication → URL Configuration
```

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs:**
```
http://localhost:5173/**
```

**Klik SAVE** 💾

### 4. Test Login
**Demo Admin:**
- Email: `admin@rt.com`
- Password: `admin123`

---

## 🔄 Jika Email Sudah Terdaftar

**Opsi 1:** Gunakan email lain untuk registrasi

**Opsi 2:** Hapus user yang error:
```
Authentication → Users → Cari email → Delete user
```

---

## ✅ Done! 

Authentication seharusnya sudah berfungsi sekarang! 🎉

📖 **Panduan lengkap:** Lihat `FIX-EMAIL-LOGIN-DISABLED.md`

# 🔧 Troubleshooting Error 403 - Sistem Manajemen RT

## 📋 Checklist Cepat

Jika Anda mengalami error **"Failed to load resource: 403 Forbidden"**, ikuti langkah-langkah berikut:

### 1. ✅ Cek Status Login
- Buka aplikasi dan lihat **Debug Panel** di kanan bawah (hanya muncul saat development)
- Pastikan:
  - ✓ User: **Logged In**
  - ✓ Role: **admin** atau **resident** (bukan None)
  - ✓ Profile: **Loaded**
  - ✓ Session: **Active**

### 2. 🔑 Verifikasi Akun Sudah Terdaftar

**Untuk Admin RT:**
```
1. Apakah sudah mendaftar via "Daftar sebagai Admin RT"?
2. Apakah sudah mengisi SEMUA field termasuk:
   - Nomor Rekening BRI
   - Nama Pemilik Rekening BRI
   - RT/RW
```

**Untuk Warga:**
```
1. Apakah sudah mendaftar via "Daftar sebagai Warga"?
2. Apakah sudah mengisi SEMUA field termasuk:
   - No. Rumah
   - RT/RW
   - Kelurahan, Kecamatan, Kota
```

### 3. 🔍 Cek Console Browser

Buka Developer Tools (F12) → Tab Console:

#### Error Pattern 1: "Unauthorized - Admin access required"
```javascript
// Artinya: User login sebagai Warga, tapi mencoba akses fitur Admin
// Solusi: Logout dan login dengan akun Admin RT
```

#### Error Pattern 2: "No profile found"
```javascript
// Artinya: User berhasil login, tapi tidak ada profile di database
// Solusi: Cek apakah pendaftaran berhasil sempurna
```

#### Error Pattern 3: "Invalid token" atau "No access token"
```javascript
// Artinya: Session expired atau tidak tersimpan
// Solusi: Logout dan login ulang
```

### 4. 🗄️ Verifikasi Database Supabase

Login ke Supabase Dashboard → Table Editor:

#### Cek Table: `admin_profiles`
```sql
-- Cek apakah data Admin ada
SELECT * FROM admin_profiles WHERE email = 'email@anda.com';

-- Harus ada kolom:
- id (UUID dari auth.users)
- email
- name
- rt, rw
- bri_account_number
- bri_account_name
```

#### Cek Table: `resident_profiles`
```sql
-- Cek apakah data Warga ada
SELECT * FROM resident_profiles WHERE email = 'email@anda.com';

-- Harus ada kolom:
- id (UUID dari auth.users)
- email
- name
- house_number
- rt, rw
```

#### Cek Table: `auth.users`
```sql
-- Cek apakah user sudah terdaftar di auth
SELECT id, email, created_at FROM auth.users WHERE email = 'email@anda.com';
```

### 5. 🛡️ Verifikasi Row Level Security (RLS)

Di Supabase Dashboard → Authentication → Policies:

#### Policies yang HARUS ada untuk `admin_profiles`:
```sql
-- Policy: Allow admin to read own profile
CREATE POLICY "Allow admin read own profile" ON admin_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy: Allow service role full access
CREATE POLICY "Service role full access" ON admin_profiles
FOR ALL USING (auth.role() = 'service_role');
```

#### Policies yang HARUS ada untuk `resident_profiles`:
```sql
-- Policy: Allow resident to read own profile
CREATE POLICY "Allow resident read own profile" ON resident_profiles
FOR SELECT USING (auth.uid() = id);

-- Policy: Allow admin to read residents in same RT/RW
CREATE POLICY "Allow admin read same RT RW" ON resident_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.rt = resident_profiles.rt
    AND admin_profiles.rw = resident_profiles.rw
  )
);
```

### 6. 🔐 Cek Environment Variables

File: `/utils/supabase/info.tsx`

Pastikan berisi:
```typescript
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

**Cara mendapatkan nilai yang benar:**
1. Buka Supabase Dashboard
2. Settings → API
3. Copy:
   - Project URL → ambil ID setelah `https://` dan sebelum `.supabase.co`
   - `anon` `public` key → copy seluruhnya

### 7. 🚀 Solusi Umum

#### Solusi 1: Logout dan Login Ulang
```javascript
1. Klik tombol Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Tutup browser
4. Buka kembali dan login
```

#### Solusi 2: Daftar Ulang dengan Data Lengkap
```javascript
1. Pastikan SEMUA field terisi saat registrasi
2. Tunggu notifikasi "Pendaftaran berhasil"
3. Login dengan email dan password yang sama
```

#### Solusi 3: Periksa Network Tab
```javascript
1. Buka DevTools (F12) → Network tab
2. Coba login
3. Cari request yang gagal (warna merah)
4. Klik → Preview/Response untuk lihat error detail
```

### 8. 📞 Informasi Error untuk Developer

Jika masih bermasalah, screenshot dan kirim:

1. **Debug Panel** (kanan bawah):
   - Status: Loading, User, Role, Profile, Session

2. **Console Errors** (F12 → Console):
   - Copy semua error yang muncul

3. **Network Response** (F12 → Network):
   - Klik request yang error 403
   - Tab "Response" → screenshot

4. **URL yang Error**:
   - Catat URL lengkap yang mengembalikan 403

---

## 🎯 Quick Fix Commands

### Jika Profile Tidak Muncul Setelah Login:

**Cek di Supabase SQL Editor:**
```sql
-- Lihat semua users yang terdaftar
SELECT u.id, u.email, u.created_at,
       CASE 
         WHEN a.id IS NOT NULL THEN 'admin'
         WHEN r.id IS NOT NULL THEN 'resident'
         ELSE 'no_profile'
       END as role
FROM auth.users u
LEFT JOIN admin_profiles a ON a.id = u.id
LEFT JOIN resident_profiles r ON r.id = u.id
ORDER BY u.created_at DESC;
```

### Jika Butuh Recreate Profile:

**Admin Profile:**
```sql
INSERT INTO admin_profiles (
  id, email, name, position, phone, address, 
  rt, rw, bri_account_number, bri_account_name
)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',
  'admin@email.com',
  'Nama Admin',
  'Ketua RT',
  '08123456789',
  'Alamat lengkap',
  '001',
  '002',
  '1234567890123',
  'Nama Pemilik Rekening'
);
```

**Resident Profile:**
```sql
INSERT INTO resident_profiles (
  id, email, name, house_number, rt, rw, 
  phone, address, kelurahan, kecamatan, kota
)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',
  'warga@email.com',
  'Nama Warga',
  '12',
  '001',
  '002',
  '08123456789',
  'Alamat lengkap',
  'Kelurahan ABC',
  'Kecamatan XYZ',
  'Kota Jakarta'
);
```

---

## ⚠️ Catatan Penting

1. **Error 403 ≠ Login Gagal**
   - 403 artinya login berhasil, tapi tidak punya akses ke resource
   - Cek apakah Anda login dengan role yang benar

2. **Admin hanya bisa lihat data RT/RW yang sama**
   - Admin RT 001/002 tidak bisa akses data RT 003/004
   - Pastikan RT/RW match dengan data warga

3. **Session expire setelah beberapa waktu**
   - Jika lama tidak digunakan, perlu login ulang
   - Ini normal untuk keamanan

4. **Browser Cache**
   - Kadang browser cache token lama
   - Clear cache jika mengalami masalah persisten

---

Semoga panduan ini membantu! 🎉

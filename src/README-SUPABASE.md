# Setup Supabase untuk Sistem Manajemen RT

## ✅ Kredensial Supabase Sudah Terkonfigurasi

Aplikasi sudah otomatis terhubung dengan Supabase menggunakan kredensial dari file `/utils/supabase/info.tsx`.

**Project ID:** ywhposeilhrdzjsibjrd  
**Project URL:** https://ywhposeilhrdzjsibjrd.supabase.co

## Langkah 1: Setup Database

1. Buka [Supabase Dashboard](https://supabase.com/dashboard/project/ywhposeilhrdzjsibjrd)
2. Buka **SQL Editor** di sidebar
3. Copy dan jalankan seluruh isi file `supabase-schema.sql`
4. Tunggu sampai semua tabel dan policies terbuat (akan muncul pesan "Success")

## Langkah 2: Konfigurasi Email Authentication

1. Buka Authentication > Settings di dashboard Supabase
2. Pastikan "Enable Email Signup" diaktifkan
3. (Opsional) Konfigurasi SMTP untuk custom email template

## Struktur Database

### Tables:
- **admin_profiles**: Menyimpan profil Admin RT
- **resident_profiles**: Menyimpan profil Warga
- **fee_payments**: Menyimpan data pembayaran iuran
- **waste_deposits**: Menyimpan data setoran bank sampah
- **schedules**: Menyimpan jadwal pengangkutan sampah
- **notifications**: Menyimpan notifikasi untuk user

### Row Level Security (RLS):
Semua tabel sudah dikonfigurasi dengan RLS policies untuk memastikan:
- Admin hanya bisa akses data admin
- Warga hanya bisa akses data mereka sendiri
- Admin bisa melihat dan mengelola semua data warga

### Triggers:
- **update_waste_bank_balance**: Otomatis menambah saldo bank sampah saat ada setoran baru
- **deduct_waste_bank_balance**: Otomatis mengurangi saldo saat digunakan untuk pembayaran iuran

## Testing

Setelah setup database selesai, Anda bisa:
1. Buka aplikasi dan klik **Daftar sebagai Admin RT** atau **Daftar sebagai Warga**
2. Isi form pendaftaran dengan lengkap
3. Login dengan kredensial yang sudah dibuat
4. Test semua fitur seperti pembayaran iuran dan setoran bank sampah

## Troubleshooting

### Error: "relation does not exist"
- Pastikan SQL schema sudah dijalankan di SQL Editor
- Cek di Table Editor apakah semua tabel sudah terbuat

### Error: Row Level Security
- Pastikan semua RLS policies sudah dijalankan dari SQL Editor
- Cek di Table Editor > Policies untuk memverifikasi

### Email Confirmation
- Secara default, Supabase memerlukan email confirmation
- Untuk development, bisa dinonaktifkan di:
  1. Buka **Authentication > Providers > Email**
  2. Matikan **Confirm email**
  3. Klik **Save**

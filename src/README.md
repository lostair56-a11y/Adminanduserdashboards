# 🏘️ Sistem Manajemen RT

Platform digital lengkap untuk mengelola iuran RT dan bank sampah digital dengan sistem autentikasi berbasis role (Admin RT dan Warga).

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)

---

## ✨ Fitur Utama

### 👨‍💼 Panel Admin RT
- 📊 **Dashboard Statistik** - Monitoring real-time iuran dan bank sampah
- 👥 **Manajemen Warga** - CRUD lengkap data warga dengan filter RT/RW
- 💰 **Kelola Iuran** - Pencatatan dan pelacakan pembayaran iuran bulanan
- ♻️ **Bank Sampah Digital** - Catat setoran sampah dan kelola saldo warga
- 📅 **Jadwal Pengangkutan** - Atur jadwal pengangkutan sampah per area
- 📈 **Laporan & Analitik** - Visualisasi grafik dan statistik lengkap

### 🏠 Panel Warga
- 📊 **Dashboard Personal** - Lihat status iuran dan saldo bank sampah
- 💳 **Riwayat Iuran** - Track pembayaran iuran bulanan
- 🏦 **Saldo Bank Sampah** - Monitor saldo dan riwayat setoran
- 💸 **Bayar dengan Saldo** - Gunakan saldo bank sampah untuk bayar iuran
- 📅 **Jadwal Pengangkutan** - Lihat jadwal pengangkutan sampah area Anda
- 🔔 **Notifikasi** - Update tentang iuran dan jadwal terbaru

### 🔐 Keamanan & Autentikasi
- ✅ **Role-Based Access Control** - Pemisahan akses Admin dan Warga
- 🔒 **Row Level Security (RLS)** - Proteksi data level database
- 🔑 **Session Management** - Manajemen sesi login yang aman
- 🛡️ **Data Isolation** - Admin hanya akses data RT/RW yang sama

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework modern
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Fast build tool
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions (Deno)
- **Hono** - Web framework untuk Edge Functions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Akun Supabase (gratis)

### 1. Clone Repository
```bash
git clone <repository-url>
cd sistem-manajemen-rt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

#### 3.1 Buat Project Supabase
1. Login ke https://app.supabase.com
2. Buat project baru
3. Tunggu hingga project ready

#### 3.2 Setup Database
1. Buka SQL Editor di Supabase Dashboard
2. Copy semua isi file `supabase/schema.sql`
3. Paste dan Run di SQL Editor
4. Verifikasi 6 tables sudah dibuat

#### 3.3 Update Credentials
Update file `/utils/supabase/info.tsx`:
```typescript
export const projectId = "your-project-id"
export const publicAnonKey = "your-anon-key"
```

Atau gunakan environment variables di `.env`:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy make-server-64eec44a
```

### 5. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## 📦 Build untuk Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

Output akan ada di folder `dist/`

---

## 🌐 Deployment

### Deploy ke Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy ke Netlify
```bash
# Build
npm run build

# Drag & drop folder 'dist' ke Netlify
```

### Deploy ke Cloudflare Pages
```bash
# Build
npm run build

# Upload folder 'dist' ke Cloudflare Pages
```

📖 **Panduan deployment lengkap:** Lihat `DEPLOYMENT_GUIDE.md`

---

## 🗄️ Database Schema

### Tables
- `admin_profiles` - Data profil Admin RT
- `resident_profiles` - Data profil Warga
- `fee_payments` - Riwayat pembayaran iuran
- `waste_deposits` - Riwayat setoran bank sampah
- `schedules` - Jadwal pengangkutan sampah
- `notifications` - Notifikasi untuk users

### Relations
```
auth.users (1) ──→ (1) admin_profiles
auth.users (1) ──→ (1) resident_profiles
resident_profiles (1) ──→ (N) fee_payments
resident_profiles (1) ──→ (N) waste_deposits
admin_profiles (1) ──→ (N) schedules
auth.users (1) ──→ (N) notifications
```

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Backend (Supabase Secrets):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **PENTING:** 
- `SUPABASE_SERVICE_ROLE_KEY` HANYA untuk backend
- JANGAN expose `service_role` key di frontend!

---

## 👥 Usage Guide

### Registrasi Admin RT
1. Buka aplikasi
2. Klik "Daftar sebagai Admin RT"
3. Isi semua field termasuk:
   - Data pribadi (nama, email, password)
   - Data RT/RW
   - **Nomor Rekening BRI** (wajib untuk terima transfer iuran)
4. Klik "Daftar"
5. Login dengan kredensial yang dibuat

### Registrasi Warga
1. Klik "Daftar sebagai Warga"
2. Isi semua field termasuk:
   - Data pribadi
   - Nomor rumah
   - RT/RW (harus sama dengan Admin RT yang mengelola)
   - Alamat lengkap
3. Klik "Daftar"
4. Login dengan kredensial yang dibuat

### Login
- **Admin RT:** Pilih "Login Admin RT"
- **Warga:** Pilih "Login Warga"

Sistem akan otomatis memverifikasi role dan redirect ke dashboard yang sesuai.

---

## 🐛 Troubleshooting

### Error 403 Forbidden
**Penyebab:** RLS policies atau authentication issue

**Solusi:**
1. Pastikan sudah jalankan `schema.sql` lengkap
2. Cek apakah sudah login dengan role yang benar
3. Verifikasi RT/RW match antara Admin dan Warga
4. Lihat Console browser (F12) untuk error detail

📖 **Panduan troubleshooting lengkap:** Lihat `TROUBLESHOOTING_403.md`

### Build Error
```bash
# Clear cache dan reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Edge Function Timeout
**Solusi:**
1. Cek Supabase Dashboard → Edge Functions → Logs
2. Pastikan environment variables sudah di-set
3. Verifikasi `service_role` key valid

---

## 📁 Project Structure

```
sistem-manajemen-rt/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Login & Register components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AdminDashboard.tsx
│   │   ├── ResidentDashboard.tsx
│   │   └── ...
│   ├── contexts/           # React contexts (Auth, etc)
│   ├── lib/                # Libraries & utilities
│   ├── styles/             # Global styles & Tailwind
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── functions/          # Edge Functions
│   │   └── server/         # Backend API
│   │       ├── index.tsx   # Main server
│   │       ├── fees.tsx    # Fee management routes
│   │       ├── residents.tsx # Resident routes
│   │       ├── wastebank.tsx # Waste bank routes
│   │       └── schedules.tsx # Schedule routes
│   └── schema.sql          # Database schema
├── public/                 # Static assets
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
├── TROUBLESHOOTING_403.md  # Troubleshooting guide
├── package.json
├── vite.config.ts
└── README.md              # This file
```

---

## 🔐 Security

### Best Practices Implemented
- ✅ Row Level Security (RLS) enabled
- ✅ Service role key tidak exposed di frontend
- ✅ Input validation di frontend & backend
- ✅ Password hashing by Supabase Auth
- ✅ JWT-based authentication
- ✅ CORS configured properly
- ✅ Data isolation per RT/RW

### Security Checklist
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` secara berkala
- [ ] Monitor Supabase logs untuk aktivitas mencurigakan
- [ ] Backup database secara berkala
- [ ] Review RLS policies secara periodic
- [ ] Update dependencies rutin (`npm audit`)

---

## 📊 Database Backup

### Manual Backup via Supabase Dashboard
1. Dashboard → Database → Backups
2. Klik "Create backup"
3. Download backup file

### Automated Backup (Pro Plan)
Supabase Pro plan support automatic daily backups.

---

## 🤝 Contributing

Contributions welcome! Untuk berkontribusi:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 📞 Support & Contact

- **Documentation:** Lihat file `DEPLOYMENT_GUIDE.md` dan `TROUBLESHOOTING_403.md`
- **Issues:** Buat issue di GitHub repository
- **Email:** [email support jika ada]

---

## 🎯 Roadmap

### v1.1 (Coming Soon)
- [ ] Email notifications untuk reminder iuran
- [ ] Export laporan ke PDF/Excel
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration untuk notifikasi

### v1.2
- [ ] Multi-RT/RW management untuk Admin Super
- [ ] Dashboard untuk Ketua RW
- [ ] Sistem voting online
- [ ] Forum diskusi warga

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Charts

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Warga Dashboard
![Warga Dashboard](docs/screenshots/warga-dashboard.png)

### Mobile Responsive
![Mobile View](docs/screenshots/mobile-view.png)

---

**Dibuat dengan ❤️ untuk komunitas RT di Indonesia**

---

## 🔄 Changelog

### v1.0.0 (2024)
- ✅ Initial release
- ✅ Admin & Warga authentication
- ✅ Fee management
- ✅ Waste bank management
- ✅ Schedule management
- ✅ Reports & analytics
- ✅ Mobile responsive design

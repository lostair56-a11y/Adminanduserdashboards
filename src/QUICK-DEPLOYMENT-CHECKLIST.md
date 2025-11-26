# ⚡ Quick Deployment Checklist

## 🎯 Deploy SikasRT dalam 10 Menit

### ✅ Pre-Deployment (5 menit)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env dengan credentials Supabase Anda

# 3. Test build
npm run build

# 4. Test preview
npm run preview
```

**Expected:** ✅ Build berhasil, preview berjalan tanpa error

---

### ✅ Supabase Setup (3 menit)

1. **Create project** di [supabase.com](https://supabase.com)
2. **Run schema**: SQL Editor → paste `/supabase/schema.sql` → Run
3. **Deploy functions**:
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   supabase functions deploy make-server-64eec44a
   supabase secrets set SUPABASE_URL=https://xxx.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=xxx
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx
   supabase secrets set SUPABASE_DB_URL=postgresql://...
   ```

---

### ✅ Deploy (2 menit)

#### Vercel:

```bash
# Push to GitHub
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/username/sikasrt.git
git push -u origin main

# Import di vercel.com:
# 1. New Project → Import GitHub repo
# 2. Add Environment Variables (4 vars dari .env)
# 3. Deploy!
```

#### Netlify:

```bash
# Same as Vercel, tapi import di netlify.com
```

---

### ✅ Test Production

1. Buka URL dari Vercel/Netlify
2. Login: `admin@rt.com` / `admin123`
3. ✅ Dashboard loading → **BERHASIL!** 🎉

---

## 🐛 Quick Fixes

**Build error?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Edge function error?**
```bash
supabase functions deploy make-server-64eec44a
supabase functions logs make-server-64eec44a
```

**Login error?**
- Cek environment variables di Vercel/Netlify
- Pastikan edge functions sudah deployed
- Check console (F12) untuk error details

---

## 📖 Full Guide

Lihat `DEPLOYMENT-FIX-GUIDE.md` untuk panduan lengkap & troubleshooting detail.

---

**Quick Links:**
- Supabase: https://supabase.com/dashboard
- Vercel: https://vercel.com/dashboard
- Netlify: https://app.netlify.com

**Demo Login:**
- Email: `admin@rt.com`
- Password: `admin123`

---

✅ **All errors fixed!** Application ready for production! 🚀

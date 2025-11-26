# 🔍 How to Check if Email Provider is Enabled

## Quick Check Method

### Method 1: Via Supabase Dashboard (Visual)

1. Login ke https://supabase.com/dashboard
2. Pilih project SikasRT Anda
3. Sidebar → **Authentication** → **Providers**
4. Cari provider **"Email"**

**Lihat Status:**

✅ **CORRECT (Email Enabled):**
```
┌────────────────────────────────────┐
│ Email                    [Enabled] │ ← Status "Enabled"
│ Email login and signup             │
└────────────────────────────────────┘
```

❌ **WRONG (Email Disabled):**
```
┌────────────────────────────────────┐
│ Email                   [Disabled] │ ← Status "Disabled"
│ Email login and signup             │
└────────────────────────────────────┘
```

### Method 2: Test Login

**Quick Test:**

1. Buka aplikasi di browser
2. Pilih "Login sebagai Admin RT"
3. Masukkan:
   - Email: `admin@rt.com`
   - Password: `admin123`
4. Klik "Masuk"

**Result:**

✅ **Email Provider ENABLED:**
```
Login berhasil → Redirect ke dashboard
```

❌ **Email Provider DISABLED:**
```
Error: ⚠️ CRITICAL: Email Provider belum di-enable...
[Long error message with instructions]
```

### Method 3: Check Edge Function Logs

```bash
# Deploy edge function
supabase functions deploy make-server-64eec44a

# Try login via curl
curl -X POST https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-64eec44a/login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{"email":"admin@rt.com","password":"admin123","role":"admin"}'

# Check logs
supabase functions logs make-server-64eec44a
```

**Result:**

✅ **Email Provider ENABLED:**
```json
{
  "success": true,
  "user": {...},
  "session": {...},
  "profile": {...},
  "role": "admin"
}
```

❌ **Email Provider DISABLED:**
```json
{
  "error": "⚠️ CRITICAL: Email Provider belum di-enable...",
  "code": "EMAIL_PROVIDER_DISABLED",
  "action_required": "ENABLE_EMAIL_PROVIDER_IN_DASHBOARD"
}
```

---

## Visual Guide - What to Look For

### In Supabase Dashboard:

When you open **Authentication → Providers**, you should see:

```
┌─────────────────────────────────────────────┐
│ Providers                                   │
│ Configure third-party auth providers       │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ Email                        [Enabled]   │ ← Should be "Enabled"
│                                             │
│ ☐ Phone                        [Disabled]  │
│ ☐ Apple                        [Disabled]  │
│ ☐ Google                       [Disabled]  │
│ ☐ GitHub                       [Disabled]  │
│                                             │
└─────────────────────────────────────────────┘
```

### Click on "Email" row to expand:

```
┌─────────────────────────────────────────────┐
│ Email Provider Settings                     │
├─────────────────────────────────────────────┤
│                                             │
│ Enable Email provider        [ON]  ← Green  │
│                                             │
│ ✅ Enable email signup                      │
│ ✅ Enable email login                       │
│ ☐ Confirm email          ← Should be OFF   │
│                                             │
│ [Save]                                      │
└─────────────────────────────────────────────┘
```

---

## Common Mistakes

### ❌ Mistake 1: Toggle OFF
```
Enable Email provider        [OFF]  ← RED - WRONG!
```
**Fix:** Click toggle to turn ON (should be green)

### ❌ Mistake 2: Checkboxes Unchecked
```
☐ Enable email signup    ← Unchecked - WRONG!
☐ Enable email login     ← Unchecked - WRONG!
```
**Fix:** Check both boxes

### ❌ Mistake 3: Confirm Email Checked
```
✅ Confirm email    ← Checked - WRONG for dev!
```
**Fix:** Uncheck this (unless you have SMTP setup)

### ❌ Mistake 4: Not Saving
**Fix:** Always click "Save" button after changes!

---

## Verification Checklist

After enabling, verify:

- [ ] Status shows **[Enabled]** not [Disabled]
- [ ] Toggle switch is **ON** (green)
- [ ] **Enable email signup** is ✅ checked
- [ ] **Enable email login** is ✅ checked
- [ ] **Confirm email** is ☐ unchecked
- [ ] Clicked **Save** button
- [ ] Page refreshed to verify settings saved
- [ ] Test login works without error

---

## If Still Shows Error

### Checklist:

1. **Did you click Save?**
   - Settings don't apply until you save
   - Refresh page to verify

2. **Correct Project?**
   - Make sure you're in the right Supabase project
   - Check URL: `dashboard/project/[YOUR-PROJECT-ID]`

3. **Wait & Retry**
   - Wait 1-2 minutes after saving
   - Sometimes takes time to propagate

4. **Clear Cache**
   - Browser: Ctrl+Shift+Delete
   - Hard reload: Ctrl+Shift+R

5. **Re-deploy Functions**
   ```bash
   supabase functions deploy make-server-64eec44a
   ```

---

## Success Indicators

✅ **Email Provider is Correctly Enabled when:**

1. Dashboard shows **[Enabled]** status
2. Toggle switch is **ON** (green color)
3. Both signup and login are checked ✅
4. Test login returns success (not error)
5. Edge function logs show no "email_provider_disabled"
6. Users can register new accounts
7. Users can login successfully

---

## Need More Help?

If email provider is enabled but still getting errors:

1. Read: `CRITICAL-ENABLE-EMAIL-PROVIDER.md`
2. Check: Browser console (F12)
3. Check: Edge function logs
4. Verify: All environment variables set
5. Try: Different browser (clear cache)

---

**Remember:** Email Provider MUST be enabled for the app to work!

**Time to enable:** 2 minutes  
**Difficulty:** Easy  
**Required:** YES - Cannot skip!

✅ Once enabled, app will work 100%!

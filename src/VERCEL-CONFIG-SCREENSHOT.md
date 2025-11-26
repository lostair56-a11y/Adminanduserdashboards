# 📸 Vercel Configuration - Visual Guide

## 🎯 Exact Settings untuk SikasRT

### Part 1: Framework Preset

**Location:** Settings > General > Framework Preset

```
┌─────────────────────────────────────┐
│ Framework Preset                    │
│                                     │
│ [Dropdown] Vite            ▼       │
│                                     │
│ Other options:                      │
│ - Vite         ← TRY THIS FIRST    │
│ - Other        ← IF VITE FAILS     │
│ - Next.js      ← DON'T USE         │
│ - Create React App ← DON'T USE     │
│                                     │
└─────────────────────────────────────┘
```

---

### Part 2: Build & Development Settings

**Location:** Settings > Build & Development Settings

```
┌─────────────────────────────────────────────────┐
│ Build & Development Settings                    │
│                                                  │
│ ┌───────────────────────────────────────────┐  │
│ │ Build Command                             │  │
│ │ [x] Override                              │  │
│ │                                           │  │
│ │ npm run build                             │  │
│ │                                           │  │
│ └───────────────────────────────────────────┘  │
│                                                  │
│ ┌───────────────────────────────────────────┐  │
│ │ Output Directory                          │  │
│ │ [x] Override                              │  │
│ │                                           │  │
│ │ dist                                      │  │
│ │                                           │  │
│ └───────────────────────────────────────────┘  │
│                                                  │
│ ┌───────────────────────────────────────────┐  │
│ │ Install Command                           │  │
│ │ [x] Override                              │  │
│ │                                           │  │
│ │ npm install                               │  │
│ │                                           │  │
│ └───────────────────────────────────────────┘  │
│                                                  │
│ [Save] button                                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**IMPORTANT CHECKLIST:**
- [ ] Build Command = `npm run build` (exact)
- [ ] Output Directory = `dist` (exact, lowercase)
- [ ] Install Command = `npm install` (exact)
- [ ] ALL three "Override" checkboxes are CHECKED ✅

---

### Part 3: Node.js Version

**Location:** Settings > General > Node.js Version

```
┌─────────────────────────────────────┐
│ Node.js Version                     │
│                                     │
│ [Dropdown] 18.x            ▼       │
│                                     │
│ Recommended:                        │
│ - 18.x         ← USE THIS          │
│ - 20.x         ← OR THIS           │
│ - 16.x         ← TOO OLD           │
│                                     │
└─────────────────────────────────────┘
```

---

### Part 4: Environment Variables (Optional)

**Location:** Settings > Environment Variables

Jika menggunakan Supabase:

```
┌──────────────────────────────────────────────────┐
│ Environment Variables                            │
│                                                   │
│ KEY: VITE_SUPABASE_URL                          │
│ VALUE: https://xxx.supabase.co                  │
│ ENVIRONMENTS: ☑ Production ☑ Preview ☑ Dev     │
│                                                   │
│ KEY: VITE_SUPABASE_ANON_KEY                     │
│ VALUE: eyJxxx...                                │
│ ENVIRONMENTS: ☑ Production ☑ Preview ☑ Dev     │
│                                                   │
│ [Add] button                                     │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Note:** Jika tidak pakai environment variables, skip ini.

---

## 🔄 Deployment Process

### Step 1: Verify Settings

```
Settings Tab
├── General
│   ├── Framework Preset = Vite/Other
│   └── Node.js Version = 18.x
└── Build & Development Settings
    ├── Build Command = npm run build ✅
    ├── Output Directory = dist ✅
    └── Install Command = npm install ✅
```

### Step 2: Clear Cache

```
Settings > General
↓
Scroll to bottom
↓
┌─────────────────────────────┐
│ Build Cache                 │
│                             │
│ [Clear Build Cache] button  │
│                             │
└─────────────────────────────┘
```

### Step 3: Redeploy

```
Deployments Tab
↓
Find latest deployment
↓
Click [...] (three dots)
↓
┌──────────────────────────────┐
│ [Redeploy] option            │
│                              │
│ ☐ Use existing Build Cache   │ ← UNCHECK THIS!
│                              │
│ [Redeploy] button            │
│                              │
└──────────────────────────────┘
```

---

## 📊 Build Logs - What to Look For

### ✅ SUCCESS Logs:

```
[HH:MM:SS] Cloning github.com/username/sikasrt
[HH:MM:SS] Running "npm install"
[HH:MM:SS] Installing dependencies...
[HH:MM:SS] Running "npm run build"
[HH:MM:SS] 
[HH:MM:SS] > sikasrt@1.0.0 build
[HH:MM:SS] > vite build
[HH:MM:SS] 
[HH:MM:SS] vite v5.1.0 building for production...
[HH:MM:SS] transforming...
[HH:MM:SS] ✓ 1234 modules transformed.
[HH:MM:SS] rendering chunks...
[HH:MM:SS] computing gzip size...
[HH:MM:SS] dist/index.html                   0.45 kB │ gzip:  0.30 kB
[HH:MM:SS] dist/assets/index-abc123.css    123.45 kB │ gzip: 12.34 kB
[HH:MM:SS] dist/assets/index-xyz789.js     234.56 kB │ gzip: 23.45 kB
[HH:MM:SS] ✓ built in 45.67s
[HH:MM:SS] 
[HH:MM:SS] Build Completed in 1m 23s
[HH:MM:SS] Deploying outputs...
[HH:MM:SS] Deployment completed
```

**Key indicators:**
- ✅ "Running npm run build"
- ✅ "vite v5.x.x building"
- ✅ "dist/index.html"
- ✅ "dist/assets/"
- ✅ "✓ built in XXs"
- ✅ "Build Completed"

### ❌ FAILURE Logs:

```
[HH:MM:SS] Running "npm install"
[HH:MM:SS] Installing dependencies...
[HH:MM:SS] Build Completed in 15s
[HH:MM:SS] Error: No Output Directory named "dist" found after the Build completed.
```

**Key indicators:**
- ❌ No "npm run build" line
- ❌ No "vite building" line
- ❌ Build too fast (<30s)
- ❌ "No Output Directory" error

**Problem:** Build command didn't run!
**Solution:** Check "Override" checkboxes di settings

---

## 🔍 Troubleshooting Matrix

| Symptom | Cause | Fix |
|---------|-------|-----|
| No "npm run build" in logs | Build command not set | Override = YES + set command |
| Build too fast (<30s) | Build command not running | Clear cache + redeploy |
| Wrong framework detected | Auto-detection wrong | Change to "Other" |
| TypeScript errors | Strict checking | Already fixed in tsconfig |
| Module not found | Dependency missing | Check package.json |
| Out of memory | Large build | Add NODE_OPTIONS to build cmd |

---

## 📋 Pre-Deployment Checklist

Before clicking "Redeploy":

```
Local Verification:
├── [x] npm run build works
├── [x] dist/ folder exists
├── [x] dist/index.html exists
└── [x] No errors in console

Vercel Settings:
├── [x] Framework = Vite or Other
├── [x] Build Command = npm run build
├── [x] Output Directory = dist
├── [x] Install Command = npm install
├── [x] Override checked for all three
├── [x] Node.js = 18.x
└── [x] Build cache cleared

Git Status:
├── [x] All changes committed
├── [x] Pushed to main/master
└── [x] Latest commit visible in Vercel

Ready to Deploy:
└── [x] Click Redeploy (without cache)
```

---

## 💡 Common Mistakes

### Mistake 1: Not Checking "Override"
```
❌ Build Command: npm run build
   [ ] Override  ← UNCHECKED!

✅ Build Command: npm run build
   [x] Override  ← CHECKED!
```

### Mistake 2: Wrong Output Directory
```
❌ Output Directory: build
❌ Output Directory: public
❌ Output Directory: Dist  (capital D)

✅ Output Directory: dist  (lowercase)
```

### Mistake 3: Using Cached Build
```
❌ Redeploy with:
   [x] Use existing Build Cache

✅ Redeploy with:
   [ ] Use existing Build Cache  ← UNCHECKED!
```

### Mistake 4: Wrong Framework
```
❌ Framework: Next.js
❌ Framework: Create React App

✅ Framework: Vite
✅ Framework: Other
```

---

## 🎯 Quick Reference Card

```
╔════════════════════════════════════════╗
║  SIKASRT VERCEL CONFIGURATION         ║
╠════════════════════════════════════════╣
║  Framework:     Vite or Other         ║
║  Build:         npm run build         ║
║  Output:        dist                  ║
║  Install:       npm install           ║
║  Node:          18.x                  ║
║  Override:      YES (all)             ║
║  Cache:         Clear before deploy   ║
╚════════════════════════════════════════╝
```

---

**Copy this configuration exactly as shown!** 📋✅

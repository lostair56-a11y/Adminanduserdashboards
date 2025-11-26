# 🔍 Debug Build Error - Quick Reference

## Test Build Lokal

```bash
npm run build
```

## Possible Errors & Solutions

### Error 1: "Cannot find module"
```
Error: Cannot find module 'xyz'
```
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error 2: TypeScript Error
```
error TS2xxx: ...
```
**Solution:**
Already fixed in `tsconfig.json` with `strict: false`

If still error:
```bash
# Check TypeScript
npx tsc --noEmit

# If error shows, send me the error
```

### Error 3: Vite Build Failed
```
[vite]: Rollup failed to resolve import
```
**Solution:**
Check import paths in your files. Should be relative:
- ✅ `import { X } from './components/X'`
- ❌ `import { X } from '@/components/X'`

### Error 4: Out of Memory
```
FATAL ERROR: ... JavaScript heap out of memory
```
**Solution:**
```bash
# Increase memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

Add to `package.json`:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

### Error 5: PostCSS/Tailwind Error
```
Error: Cannot find module 'tailwindcss'
```
**Solution:**
```bash
npm install -D tailwindcss postcss autoprefixer
npm run build
```

### Error 6: Dependency Issue
```
npm ERR! peer dep missing
```
**Solution:**
```bash
npm install --legacy-peer-deps
npm run build
```

## Vercel-Specific Errors

### Error: "No Output Directory 'dist' found"

**Check 1: Local build works?**
```bash
npm run build
ls dist/
# Should show: index.html, assets/, etc.
```

**Check 2: Vercel settings correct?**
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- Install Command: (leave empty)

**Check 3: vercel.json correct?**
```bash
cat vercel.json
# Should show outputDirectory: "dist"
```

**Check 4: Clear Vercel cache**
1. Project Settings > General
2. Scroll down
3. Click "Clear Build Cache"
4. Redeploy

**Check 5: Re-import project**
1. Delete project in Vercel
2. Import again from Git
3. Don't change any settings
4. Deploy

## Common Fixes

### Fix 1: Clean Install
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Fix 2: Check Node Version
```bash
node -v
# Should be 18.x or 20.x

# If not, install correct version
nvm install 18
nvm use 18
```

### Fix 3: Update Dependencies
```bash
npm update
npm run build
```

### Fix 4: Check File Permissions
```bash
# Linux/Mac only
chmod -R 755 .
npm run build
```

## Get Build Logs from Vercel

1. Go to Vercel Dashboard
2. Click on failed deployment
3. Click "View Build Logs"
4. Copy ALL text from logs
5. Send to me for debugging

## What to Send Me if Still Failing

### For Local Build Error:
```bash
# Run and copy output
npm run build 2>&1 | tee build-error.log

# Send me build-error.log content
```

### For Vercel Build Error:
1. Full build logs from Vercel (copy all text)
2. Screenshot of error
3. Your vercel.json content
4. Your package.json content

### System Info:
```bash
node -v
npm -v
cat package.json | grep "build"
cat vercel.json
```

## Quick Verification

Before asking for help, verify:
- [ ] `npm run build` works locally
- [ ] `dist/` folder created after build
- [ ] `dist/index.html` exists
- [ ] `vercel.json` has `"outputDirectory": "dist"`
- [ ] Changes committed and pushed to Git
- [ ] Tried clearing Vercel cache
- [ ] Build logs copied from Vercel

---

**Most common issue**: Build works locally but fails on Vercel = Usually a cache issue or Node version mismatch.

**Solution**: Clear Vercel cache + ensure Node 18.x is used.

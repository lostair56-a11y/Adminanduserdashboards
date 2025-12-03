# Komponen Animasi SikasRT

Dokumentasi komponen animasi yang digunakan di sistem SikasRT untuk meningkatkan user experience.

## 📦 Komponen yang Tersedia

### 1. LoadingSkeleton
Skeleton loading dengan shimmer effect untuk memberikan feedback visual saat data loading.

**Props:**
- `variant`: 'card' | 'text' | 'circle' | 'button' | 'input' | 'bankinfo'
- `className`: Custom styling
- `count`: Jumlah skeleton yang ditampilkan

**Penggunaan:**
```tsx
import { LoadingSkeleton, BankAccountSkeleton, CardSkeleton } from './components/animations/LoadingSkeleton';

// Basic skeleton
<LoadingSkeleton variant="input" />

// Multiple skeletons
<LoadingSkeleton variant="text" count={3} />

// Bank account skeleton (specialized)
<BankAccountSkeleton />

// Card grid skeleton
<CardSkeleton count={4} />
```

### 2. AnimatedInput
Input field dengan micro-interactions seperti focus glow, scale animation, dan error states.

**Props:**
- Semua props dari HTMLInputElement
- `label`: Label untuk input
- `error`: Error message (akan menampilkan red border dan message)

**Penggunaan:**
```tsx
import { AnimatedInput, AnimatedNumberInput, AnimatedTextarea } from './components/animations/AnimatedInput';

// Basic animated input
<AnimatedInput 
  label="Nama Lengkap"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Masukkan nama"
/>

// Number input dengan particle effect
<AnimatedNumberInput
  label="Berat (kg)"
  value={weight}
  onChange={(value) => setWeight(value)}
  step="0.1"
/>

// Textarea
<AnimatedTextarea
  label="Keterangan"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
/>
```

### 3. ConfettiEffect
Efek confetti celebration yang muncul saat tindakan berhasil (seperti pembayaran sukses).

**Props:**
- `active`: Boolean untuk mengaktifkan efek
- `onComplete`: Callback saat animasi selesai

**Penggunaan:**
```tsx
import { ConfettiEffect, SimpleConfetti, SuccessCelebration } from './components/animations/ConfettiEffect';

// Canvas-based confetti (lebih realistic)
<ConfettiEffect 
  active={showConfetti} 
  onComplete={() => setShowConfetti(false)}
/>

// CSS-based confetti (lebih ringan)
<SimpleConfetti active={showConfetti} />

// Success celebration dengan message
<SuccessCelebration 
  show={showCelebration} 
  message="Pembayaran Berhasil!"
  onComplete={() => setShowCelebration(false)}
/>
```

## 🎨 Fitur Animasi

### Shimmer Loading
- Gradient shimmer yang bergerak dari kiri ke kanan
- Memberikan feedback visual yang smooth saat data loading
- Mengurangi perceived loading time

### Focus Glow
- Border glow dengan gradient saat input difocus
- Smooth scale animation
- Color-coded untuk different states (focus, error, success)

### Micro-interactions
- Scale animation saat tap/click
- Hover effects pada buttons dan cards
- Smooth transitions pada semua state changes

### Confetti Celebration
- 100 partikel confetti dengan physics realistic
- 12 warna berbeda untuk variasi
- Gravity simulation untuk gerakan natural
- Auto-cleanup setelah 3 detik

## 🎯 Best Practices

1. **Loading States**: Selalu gunakan LoadingSkeleton untuk loading states, jangan gunakan spinner biasa
2. **Form Inputs**: Gunakan AnimatedInput untuk semua form inputs agar konsisten
3. **Success Actions**: Gunakan SuccessCelebration untuk action sukses yang penting (payment, submission)
4. **Performance**: Gunakan SimpleConfetti untuk perangkat low-end, ConfettiEffect untuk pengalaman maksimal
5. **Accessibility**: Semua animasi respect `prefers-reduced-motion`

## 📱 Responsive Design

Semua komponen animasi sudah responsive dan akan menyesuaikan dengan ukuran layar:
- Mobile: Animasi lebih subtle
- Tablet: Balanced animations
- Desktop: Full animations dengan efek maksimal

## 🔧 Customization

Anda bisa customize animasi dengan mengubah props Motion:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, type: 'spring' }}
>
  Content
</motion.div>
```

## 🎭 Animation Timings

Default timing yang digunakan:
- `duration: 0.3s` - Quick interactions (hover, tap)
- `duration: 0.5s` - Standard transitions (fade, slide)
- `duration: 1.5s` - Loading states (shimmer)
- `duration: 3s` - Celebration effects (confetti)

## 💡 Tips

1. Jangan overuse animasi - gunakan dengan bijak
2. Pastikan animasi tidak mengganggu user flow
3. Test di berbagai devices dan browsers
4. Monitor performance dengan React DevTools
5. Gunakan `AnimatePresence` untuk exit animations

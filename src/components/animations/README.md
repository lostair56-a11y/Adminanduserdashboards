# 🎨 Komponen Animasi SikasRT

Koleksi komponen animasi spektakuler menggunakan Motion (Framer Motion) untuk meningkatkan UX aplikasi SikasRT.

## 📁 Daftar Komponen

### 1. **AnimatedCard** 
Kartu dengan efek hover dan animasi masuk yang smooth.

### 2. **AnimatedInput**
Input fields dengan micro-interactions: focus glow, shake on error, success pulse.

### 3. **ConfettiEffect**
Konfeti spektakuler saat pembayaran berhasil dengan 50 partikel berwarna-warni.

### 4. **FloatingElement**
Elemen mengambang dengan gerakan smooth untuk dekorasi UI.

### 5. **GlowingBadge**
Badge dengan efek glow pulsing untuk menarik perhatian.

### 6. **LoadingSkeleton**
Skeleton loader dengan shimmer effect untuk pengalaman loading yang smooth.

### 7. **PageTransition**
Transisi halaman dengan slide dan fade effect.

### 8. **PulsingButton**
Tombol dengan efek pulsing untuk call-to-action penting.

### 9. **StaggerContainer & StaggerItem**
Container untuk animasi berurutan pada list items.

### 10. **ProofViewer** ✨ NEW
Dialog spektakuler untuk melihat bukti transfer dengan:
- Animasi 3D rotate dan zoom
- Floating particles dan shimmer effect
- Background gradient animasi
- Download dan buka di tab baru
- Glow effect pulsing
- Hover scale dan shadow

## 🎯 Cara Penggunaan ProofViewer

```tsx
import { ProofViewer } from './components/animations/ProofViewer';

// Di dalam komponen
const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

<ProofViewer
  open={!!viewProofUrl}
  onOpenChange={() => setViewProofUrl(null)}
  imageUrl={viewProofUrl!}
  title="Bukti Transfer Pembayaran"
  description="Verifikasi bukti transfer dari warga"
  downloadFilename={`bukti-${month}-${year}.jpg`}
/>
```

## 🌟 Fitur ProofViewer

1. **Animasi Masuk Spektakuler**
   - 3D rotation saat muncul
   - Scale dan fade effect
   - Spring physics untuk gerakan natural

2. **Background Animasi**
   - Gradient bergerak otomatis
   - Floating particles dengan randomized motion
   - Shimmer overlay effect

3. **Interaksi Gambar**
   - Hover untuk zoom dan shadow
   - Klik untuk toggle fullscreen
   - Loading state dengan spinner

4. **Action Buttons**
   - Buka di tab baru
   - Download dengan auto-naming
   - Close button dengan rotate animation

5. **Visual Effects**
   - Pulsing glow dengan gradasi warna
   - Sparkle particles
   - Floating orbs dengan blur

## 🎨 Tema Animasi

Semua animasi menggunakan:
- **Spring physics** untuk gerakan natural
- **Stagger effect** untuk list items
- **Hover states** untuk interaktivitas
- **Color gradients** biru-ungu-pink
- **Shadow dan glow** untuk depth

## 🚀 Performance

- Menggunakan `will-change` CSS untuk optimisasi
- Lazy rendering dengan `AnimatePresence`
- Debounced animations untuk performa smooth
- GPU acceleration untuk transform properties
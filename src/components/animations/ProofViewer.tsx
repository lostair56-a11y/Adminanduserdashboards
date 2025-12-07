import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Eye, Download, ZoomIn, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface ProofViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
  description?: string;
  downloadFilename?: string;
}

export function ProofViewer({ 
  open, 
  onOpenChange, 
  imageUrl, 
  title = 'Bukti Transfer',
  description = 'Klik gambar untuk melihat detail',
  downloadFilename = 'bukti-transfer.jpg'
}: ProofViewerProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Bukti transfer berhasil diunduh');
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Gagal mengunduh bukti transfer');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.5
              }}
              className="p-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.2, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut"
                    }}
                  >
                    💳
                  </motion.div>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {title}
                  </span>
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  {description}
                </DialogDescription>
              </DialogHeader>
              
              {/* Main image container with spectacular effects */}
              <motion.div 
                className="relative mt-4 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10"
                  animate={{
                    background: [
                      'linear-gradient(135deg, #dbeafe 0%, #fae8ff 50%, #fce7f3 100%)',
                      'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fae8ff 100%)',
                      'linear-gradient(135deg, #dbeafe 0%, #fae8ff 50%, #fce7f3 100%)',
                    ]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Sparkle particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Floating orbs */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`orb-${i}`}
                    className="absolute rounded-full opacity-20 blur-xl"
                    style={{
                      width: `${80 + Math.random() * 120}px`,
                      height: `${80 + Math.random() * 120}px`,
                      background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#ec4899',
                      left: `${i * 16}%`,
                      top: `${i % 2 === 0 ? '10%' : '80%'}`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      x: [0, Math.random() * 30 - 15, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}

                {/* Image container */}
                <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-900/5 to-gray-900/10 rounded-xl p-8 min-h-[60vh]">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setIsZoomed(!isZoomed)}
                  >
                    {imageLoading && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                      </motion.div>
                    )}

                    <motion.img 
                      src={imageUrl} 
                      alt="Bukti Transfer" 
                      className={`relative rounded-xl shadow-2xl border-8 border-white cursor-pointer transition-all ${
                        isZoomed ? 'max-w-full' : 'max-h-[65vh]'
                      }`}
                      onLoad={() => setImageLoading(false)}
                      initial={{ 
                        scale: 0.8, 
                        opacity: 0, 
                        rotateY: -30,
                        filter: 'blur(10px)'
                      }}
                      animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        rotateY: 0,
                        filter: 'blur(0px)'
                      }}
                      whileHover={{ 
                        scale: 1.03,
                        rotateY: 5,
                        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                      }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 250, 
                        damping: 25 
                      }}
                    />

                    {/* Shimmer effect overlay */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.div>

                    {/* Glow effect */}
                    <motion.div
                      className="absolute -inset-2 pointer-events-none rounded-xl"
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(59, 130, 246, 0.4)',
                          '0 0 60px rgba(147, 51, 234, 0.6)',
                          '0 0 30px rgba(236, 72, 153, 0.4)',
                          '0 0 60px rgba(59, 130, 246, 0.6)',
                        ],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Action buttons with animations */}
              <motion.div 
                className="flex gap-3 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => window.open(imageUrl, '_blank')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Buka di Tab Baru
                  </Button>
                </motion.div>

                <motion.div 
                  className="flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-2 hover:bg-green-50 hover:border-green-500 transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Bukti
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={() => onOpenChange(false)}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

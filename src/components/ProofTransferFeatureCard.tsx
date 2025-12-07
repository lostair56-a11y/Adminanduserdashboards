import { motion } from 'motion/react';
import { Eye, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function ProofTransferFeatureCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden relative">
        {/* Animated background sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}

        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="text-3xl"
            >
              📸
            </motion.div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Lihat Bukti Transfer
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                </motion.div>
              </CardTitle>
              <CardDescription>
                Fitur baru dengan animasi spektakuler!
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          <p className="text-sm text-gray-600">
            Sekarang Anda bisa melihat foto bukti transfer dengan dialog interaktif yang memukau:
          </p>

          <div className="grid grid-cols-1 gap-3">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start gap-3 p-3 bg-white/80 backdrop-blur rounded-lg border border-blue-100"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div>
                <p className="font-medium text-sm">Preview Interaktif</p>
                <p className="text-xs text-gray-600">
                  Animasi 3D, hover untuk zoom, floating particles
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start gap-3 p-3 bg-white/80 backdrop-blur rounded-lg border border-purple-100"
            >
              <Eye className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Buka Tab Baru</p>
                <p className="text-xs text-gray-600">
                  Lihat gambar ukuran penuh di tab terpisah
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-start gap-3 p-3 bg-white/80 backdrop-blur rounded-lg border border-green-100"
            >
              <Download className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Download Bukti</p>
                <p className="text-xs text-gray-600">
                  Simpan bukti transfer untuk arsip pribadi
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm text-center"
            animate={{
              boxShadow: [
                '0 0 0px rgba(59, 130, 246, 0.5)',
                '0 0 20px rgba(147, 51, 234, 0.8)',
                '0 0 0px rgba(59, 130, 246, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Cek riwayat pembayaran untuk mencoba!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

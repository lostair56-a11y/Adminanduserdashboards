import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { SuccessCelebration } from '../animations/ConfettiEffect';

interface WasteBankPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeId: string;
  amount: number;
  balance: number;
  onSuccess: () => void;
}

export function WasteBankPaymentDialog({
  open,
  onOpenChange,
  feeId,
  amount,
  balance,
  onSuccess,
}: WasteBankPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sesi berakhir, silakan login kembali');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/wastebank/pay-fee`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ feeId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Show celebration
        setShowCelebration(true);
        
        toast.success(`Pembayaran berhasil! Sisa saldo: Rp ${data.newBalance.toLocaleString('id-ID')}`);
        
        // Close after celebration
        setTimeout(() => {
          setShowCelebration(false);
          onSuccess();
          onOpenChange(false);
        }, 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal melakukan pembayaran');
      }
    } catch (error) {
      console.error('Error paying with waste bank:', error);
      toast.error('Terjadi kesalahan saat melakukan pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessCelebration 
        show={showCelebration} 
        message="Pembayaran Berhasil!"
        onComplete={() => setShowCelebration(false)}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bayar dengan Saldo Bank Sampah</DialogTitle>
            <DialogDescription>Konfirmasi penggunaan saldo untuk pembayaran iuran</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <motion.div 
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                >
                  <Wallet className="h-5 w-5 text-green-600" />
                </motion.div>
                <p className="text-sm">Saldo Anda Saat Ini</p>
              </div>
              <motion.p 
                className="text-2xl text-green-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                Rp {balance.toLocaleString('id-ID')}
              </motion.p>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                whileHover={{ borderColor: '#3b82f6', scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm text-gray-600">Jumlah Iuran</span>
                <span>Rp {amount.toLocaleString('id-ID')}</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                whileHover={{ borderColor: '#10b981', scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm text-gray-600">Sisa Saldo</span>
                <motion.span 
                  className="text-green-600"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                >
                  Rp {(balance - amount).toLocaleString('id-ID')}
                </motion.span>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                Saldo bank sampah akan dikurangi sesuai jumlah iuran. Transaksi ini tidak dapat
                dibatalkan.
              </p>
            </motion.div>

            <div className="flex gap-3 pt-4">
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onOpenChange(false)} 
                  disabled={loading}
                >
                  Batal
                </Button>
              </motion.div>
              <motion.div 
                className="flex-1" 
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: loading ? 1 : 1.02 }}
              >
                <Button 
                  className="w-full" 
                  onClick={handleConfirm} 
                  disabled={loading}
                >
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Memproses...
                    </motion.span>
                  ) : (
                    'Konfirmasi Pembayaran'
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
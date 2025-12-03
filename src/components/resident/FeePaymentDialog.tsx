import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Building2, Copy, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { BankAccountSkeleton } from '../animations/LoadingSkeleton';
import { SuccessCelebration } from '../animations/ConfettiEffect';

interface FeePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  feeId?: string;
  onPaymentSuccess?: () => void;
}

interface BankAccount {
  accountNumber: string;
  accountName: string;
  rtName: string;
  rt: string;
  rw: string;
}

export function FeePaymentDialog({ open, onOpenChange, amount, feeId, onPaymentSuccess }: FeePaymentDialogProps) {
  const [copied, setCopied] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchBankAccount();
      setPaymentProof(null);
      setPaymentProofFile(null);
    }
  }, [open]);

  const fetchBankAccount = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/admin/bank-account`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBankAccount(data.bankAccount);
      } else {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        toast.error(errorData.error || 'Gagal mengambil data rekening Admin RT');
      }
    } catch (error) {
      console.error('Error fetching bank account:', error);
      toast.error('Gagal mengambil data rekening Admin RT');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!feeId) {
      toast.error('ID tagihan tidak ditemukan');
      return;
    }

    if (!paymentProof) {
      toast.error('Silakan unggah bukti transfer terlebih dahulu');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/pay`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            feeId,
            paymentMethod: 'Bank BRI Transfer',
            paymentProof
          })
        }
      );

      if (response.ok) {
        // Show celebration
        setShowCelebration(true);
        
        toast.success('Pembayaran berhasil dicatat! Menunggu verifikasi Admin RT.');
        
        // Close after celebration
        setTimeout(() => {
          setShowCelebration(false);
          onOpenChange(false);
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }, 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mencatat pembayaran');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Gagal mencatat pembayaran');
    } finally {
      setSubmitting(false);
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pembayaran Iuran via Bank BRI</DialogTitle>
            <DialogDescription>Transfer ke rekening RT berikut</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <motion.div 
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p className="text-sm text-gray-700 mb-2">Jumlah yang Harus Dibayar</p>
              <motion.p 
                className="text-3xl text-blue-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                Rp {amount.toLocaleString('id-ID')}
              </motion.p>
            </motion.div>

            {loading ? (
              <BankAccountSkeleton />
            ) : (
              <motion.div 
                className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <motion.div 
                    className="p-2 bg-blue-600 rounded"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Building2 className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Bank</p>
                    <p className="font-medium">Bank BRI</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Admin RT {bankAccount?.rt} / RW {bankAccount?.rw}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">Nomor Rekening</p>
                    <motion.button
                      onClick={() => copyToClipboard(bankAccount?.accountNumber || '')}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="copied"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Tersalin!</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Salin</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  <motion.div 
                    className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200"
                    whileHover={{ borderColor: '#3b82f6' }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="flex-1 text-lg tracking-wider">{bankAccount?.accountNumber || 'Loading...'}</p>
                  </motion.div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-1">Nama Penerima</p>
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="font-medium">{bankAccount?.accountName || 'Loading...'}</p>
                    {bankAccount?.rtName && (
                      <p className="text-xs text-gray-500 mt-1">{bankAccount.rtName}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-amber-900">
                <strong>Petunjuk Pembayaran:</strong>
              </p>
              <ol className="text-xs text-amber-900 mt-2 space-y-1 list-decimal list-inside">
                <li>Transfer tepat sesuai jumlah yang tertera</li>
                <li>Gunakan nomor rekening yang tersedia</li>
                <li>Simpan bukti transfer Anda</li>
                <li>Upload bukti transfer di bawah ini</li>
                <li>Pembayaran akan diverifikasi oleh Admin RT</li>
              </ol>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="text-sm text-gray-700">Upload Bukti Transfer *</label>
              <div className="flex items-center gap-2">
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {paymentProof ? 'Ganti Bukti' : 'Pilih File'}
                  </Button>
                </motion.div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </div>
              <AnimatePresence>
                {paymentProof && (
                  <motion.div 
                    className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Bukti transfer telah diunggah</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {!paymentProof && (
                <p className="text-xs text-gray-500">Format: JPG, PNG (max 5MB)</p>
              )}
            </motion.div>

            <div className="flex gap-3 pt-2">
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
              </motion.div>
              <motion.div 
                className="flex-1" 
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: submitting || !paymentProof ? 1 : 1.02 }}
              >
                <Button 
                  className="w-full"
                  onClick={handleConfirmPayment} 
                  disabled={submitting || !paymentProof}
                >
                  {submitting ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Mengirim...
                    </motion.span>
                  ) : (
                    'Kirim Bukti Transfer'
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
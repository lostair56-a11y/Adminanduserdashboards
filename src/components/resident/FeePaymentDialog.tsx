import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Building2, Copy, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

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
        // NOTE: payment_proof column needs to be added to database first
        // Run this SQL in Supabase: ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
        // Temporarily disabled to prevent PGRST204 error
        // try {
        //   await supabase
        //     .from('fee_payments')
        //     .update({ payment_proof: paymentProof })
        //     .eq('id', feeId);
        // } catch (err) {
        //   console.error('Error updating payment_proof:', err);
        // }
        
        toast.success('Pembayaran berhasil dicatat! Menunggu verifikasi Admin RT.');
        onOpenChange(false);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran Iuran via Bank BRI</DialogTitle>
          <DialogDescription>Transfer ke rekening RT berikut</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">Jumlah yang Harus Dibayar</p>
            <p className="text-3xl text-blue-900">Rp {amount.toLocaleString('id-ID')}</p>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="p-2 bg-blue-600 rounded">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
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
                  <button
                    onClick={() => copyToClipboard(bankAccount?.accountNumber || '')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
                  <p className="flex-1 text-lg tracking-wider">{bankAccount?.accountNumber || 'Loading...'}</p>
                </div>
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
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
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
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Upload Bukti Transfer *</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                {paymentProof ? 'Ganti Bukti' : 'Pilih File'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={submitting}
              />
            </div>
            {paymentProof && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <ImageIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Bukti transfer telah diunggah</span>
              </div>
            )}
            {!paymentProof && (
              <p className="text-xs text-gray-500">Format: JPG, PNG (max 5MB)</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleConfirmPayment} 
              disabled={submitting || !paymentProof}
            >
              {submitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
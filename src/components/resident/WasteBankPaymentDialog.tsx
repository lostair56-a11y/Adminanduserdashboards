import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

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
        toast.success(`Pembayaran berhasil! Sisa saldo: Rp ${data.newBalance.toLocaleString('id-ID')}`);
        onSuccess();
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bayar dengan Saldo Bank Sampah</DialogTitle>
          <DialogDescription>Konfirmasi penggunaan saldo untuk pembayaran iuran</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-5 w-5 text-green-600" />
              <p className="text-sm">Saldo Anda Saat Ini</p>
            </div>
            <p className="text-2xl text-green-600">
              Rp {balance.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Jumlah Iuran</span>
              <span>Rp {amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Sisa Saldo</span>
              <span className="text-green-600">
                Rp {(balance - amount).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Saldo bank sampah akan dikurangi sesuai jumlah iuran. Transaksi ini tidak dapat
              dibatalkan.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
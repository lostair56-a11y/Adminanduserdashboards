import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Wallet, AlertCircle } from 'lucide-react';

interface WasteBankPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  balance: number;
}

export function WasteBankPaymentDialog({
  open,
  onOpenChange,
  amount,
  balance,
}: WasteBankPaymentDialogProps) {
  const handleConfirm = () => {
    alert(
      `Saldo bank sampah Anda sebesar Rp ${amount.toLocaleString('id-ID')} telah digunakan untuk membayar iuran.\n\nSisa saldo: Rp ${(balance - amount).toLocaleString('id-ID')}`
    );
    onOpenChange(false);
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
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Konfirmasi Pembayaran
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Building2, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface FeePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
}

export function FeePaymentDialog({ open, onOpenChange, amount }: FeePaymentDialogProps) {
  const [copied, setCopied] = useState(false);

  // Data rekening BRI Admin RT (dalam implementasi nyata, diambil dari backend)
  const bankAccount = {
    bankName: 'Bank BRI',
    accountNumber: '1234567890123456',
    accountName: 'RT 003 KELURAHAN MAWAR',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    alert(
      'Terima kasih! Pembayaran Anda akan diverifikasi oleh Admin RT.\n\nSilakan lakukan transfer ke rekening yang tertera dan simpan bukti transfer Anda.'
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pembayaran Iuran via Bank BRI</DialogTitle>
          <DialogDescription>Transfer ke rekening RT berikut</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">Jumlah yang Harus Dibayar</p>
            <p className="text-3xl text-blue-900">Rp {amount.toLocaleString('id-ID')}</p>
          </div>

          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="p-2 bg-blue-600 rounded">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Bank</p>
                <p className="font-medium">{bankAccount.bankName}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600">Nomor Rekening</p>
                <button
                  onClick={() => copyToClipboard(bankAccount.accountNumber)}
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
                <p className="flex-1 text-lg tracking-wider">{bankAccount.accountNumber}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Nama Penerima</p>
              <div className="p-3 bg-white rounded border border-gray-200">
                <p className="font-medium">{bankAccount.accountName}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Petunjuk Pembayaran:</strong>
            </p>
            <ol className="text-xs text-amber-900 mt-2 space-y-1 list-decimal list-inside">
              <li>Transfer tepat sesuai jumlah yang tertera</li>
              <li>Gunakan nomor rekening yang tersedia</li>
              <li>Simpan bukti transfer Anda</li>
              <li>Pembayaran akan diverifikasi oleh Admin RT</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleConfirmPayment}>
              Sudah Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
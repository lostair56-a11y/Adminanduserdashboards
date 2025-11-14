import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { CheckCircle } from 'lucide-react';

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentHistoryDialog({ open, onOpenChange }: PaymentHistoryDialogProps) {
  // Empty initial state - data will be fetched from backend
  const paymentHistory: Array<{
    id: string;
    month: string;
    amount: number;
    status: string;
    date: string | null;
    method: string | null;
  }> = [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Riwayat Pembayaran Iuran</DialogTitle>
          <DialogDescription>Histori pembayaran iuran bulanan Anda</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <p>{payment.month}</p>
                  <Badge variant={payment.status === 'Lunas' ? 'default' : 'destructive'}>
                    {payment.status === 'Lunas' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {payment.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Rp {payment.amount.toLocaleString('id-ID')}</span>
                  {payment.date && (
                    <span>
                      {new Date(payment.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • {payment.method}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
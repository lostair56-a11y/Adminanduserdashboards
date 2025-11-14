import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WasteBankHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WasteBankHistoryDialog({ open, onOpenChange }: WasteBankHistoryDialogProps) {
  // Empty initial state - data will be fetched from backend
  const transactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
  }> = [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Riwayat Transaksi Bank Sampah</DialogTitle>
          <DialogDescription>Detail setoran dan penggunaan saldo bank sampah</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada transaksi bank sampah</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="mb-1">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg ${
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'deposit' ? '+' : ''}Rp{' '}
                      {Math.abs(transaction.amount).toLocaleString('id-ID')}
                    </p>
                    <Badge
                      variant={transaction.type === 'deposit' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {transaction.type === 'deposit' ? (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Setoran
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Penarikan
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
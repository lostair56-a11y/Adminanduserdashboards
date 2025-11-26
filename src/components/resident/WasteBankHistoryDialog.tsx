import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface WasteBankHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Transaction {
  id: string;
  waste_type: string;
  weight: number;
  total_value: number;
  deposit_date: string;
}

export function WasteBankHistoryDialog({ open, onOpenChange }: WasteBankHistoryDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchTransactions();
    }
  }, [open]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/wastebank/deposits`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.deposits || []);
      }
    } catch (error) {
      console.error('Error fetching waste bank history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Riwayat Transaksi Bank Sampah</DialogTitle>
          <DialogDescription>Detail setoran dan penggunaan saldo bank sampah</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada transaksi bank sampah</p>
            </div>
          ) : (
            transactions.map((transaction) => {
              const isDeposit = transaction.total_value > 0;
              const description = isDeposit 
                ? `Setoran ${transaction.waste_type} - ${transaction.weight} kg`
                : transaction.waste_type; // For payments, waste_type contains the description
              
              return (
                <div
                  key={transaction.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="mb-1">{description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.deposit_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg ${
                          isDeposit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isDeposit ? '+' : ''}Rp{' '}
                        {Math.abs(transaction.total_value).toLocaleString('id-ID')}
                      </p>
                      <Badge
                        variant={isDeposit ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {isDeposit ? (
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
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
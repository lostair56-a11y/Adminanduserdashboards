import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, Eye, Download, Loader2, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../utils/supabase/info';
import { ProofViewer } from '../animations/ProofViewer';

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentRecord {
  id: string;
  month: string;
  year: number;
  amount: number;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  payment_proof: string | null;
}

export function PaymentHistoryDialog({ open, onOpenChange }: PaymentHistoryDialogProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPaymentHistory();
    }
  }, [open]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment history fetched:', data.fees);
        console.log('🔍 Checking payment_proof for each fee:');
        data.fees?.forEach((fee: any) => {
          console.log(`Fee ${fee.id} (${fee.month} ${fee.year}):`, {
            status: fee.status,
            payment_date: fee.payment_date,
            payment_method: fee.payment_method,
            payment_proof: fee.payment_proof
          });
        });
        setPaymentHistory(data.fees || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadProof = async (url: string, month: string, year: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bukti-transfer-${month}-${year}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading proof:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="h-3 w-3 mr-1" />;
    if (status === 'pending') return <Clock className="h-3 w-3 mr-1" />;
    return <XCircle className="h-3 w-3 mr-1" />;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === 'paid') return 'default';
    if (status === 'pending') return 'secondary';
    return 'destructive';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return 'Lunas';
    if (status === 'pending') return 'Pending';
    return 'Belum Bayar';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Riwayat Pembayaran Iuran</DialogTitle>
            <DialogDescription>Histori pembayaran iuran bulanan Anda</DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada riwayat pembayaran</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{payment.month} {payment.year}</p>
                    <Badge variant={getStatusVariant(payment.status)}>
                      {getStatusIcon(payment.status)}
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-blue-600">
                      Rp {payment.amount.toLocaleString('id-ID')}
                    </span>
                    {payment.payment_date && (
                      <span>
                        {new Date(payment.payment_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        {payment.payment_method && `• ${payment.payment_method}`}
                      </span>
                    )}
                  </div>
                  
                  {payment.payment_proof && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewProofUrl(payment.payment_proof!)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Bukti Transfer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadProof(payment.payment_proof!, payment.month, payment.year)}
                        className="hover:bg-green-50 hover:border-green-300 transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof Image Viewer with Spectacular Animations */}
      {viewProofUrl && (
        <ProofViewer
          open={!!viewProofUrl}
          onOpenChange={() => setViewProofUrl(null)}
          imageUrl={viewProofUrl}
          title="Bukti Transfer Pembayaran"
          description="Bukti transfer yang telah Anda kirimkan"
          downloadFilename={`bukti-transfer-${paymentHistory.find(p => p.payment_proof === viewProofUrl)?.month || 'pembayaran'}-${paymentHistory.find(p => p.payment_proof === viewProofUrl)?.year || ''}.jpg`}
        />
      )}
    </>
  );
}
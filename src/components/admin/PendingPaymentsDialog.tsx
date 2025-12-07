import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Eye, Loader2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { GlowingBadge } from '../animations/GlowingBadge';
import { ProofViewer } from '../animations/ProofViewer';
import { getPendingFees, verifyPayment } from '../../lib/db-helpers';

interface PendingPaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerificationComplete?: () => void;
}

interface PendingFee {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: string;
  payment_date: string;
  payment_method: string;
  payment_proof?: string;
  resident: {
    name: string;
    house_number: string;
    phone: string;
  };
}

export function PendingPaymentsDialog({ open, onOpenChange, onVerificationComplete }: PendingPaymentsDialogProps) {
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPendingPayments();
    }
  }, [open]);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const fees = await getPendingFees();
      setPendingFees(fees as any);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Gagal mengambil data pembayaran pending');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (feeId: string, action: 'approve' | 'reject') => {
    setProcessingId(feeId);
    try {
      await verifyPayment(feeId, action);
      toast.success(
        action === 'approve' 
          ? 'Pembayaran berhasil disetujui!' 
          : 'Pembayaran ditolak'
      );
      fetchPendingPayments();
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Gagal memverifikasi pembayaran');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadProof = async (url: string, name: string, month: string, year: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bukti-transfer-${name}-${month}-${year}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Gagal mengunduh bukti transfer');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pembayaran Menunggu Verifikasi</DialogTitle>
            <DialogDescription>
              Verifikasi pembayaran yang telah dikirim oleh warga
            </DialogDescription>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : pendingFees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Tidak ada pembayaran yang menunggu verifikasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingFees.map((fee, index) => (
                <motion.div 
                  key={fee.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                  className="border rounded-lg p-4 bg-amber-50 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{fee.resident.name}</p>
                      <p className="text-sm text-gray-600">
                        Rumah No. {fee.resident.house_number} | {fee.resident.phone}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Periode</p>
                      <p className="font-medium">{fee.month} {fee.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Jumlah</p>
                      <p className="font-medium text-blue-600">Rp {fee.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Metode Pembayaran</p>
                      <p className="font-medium">{fee.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tanggal Transfer</p>
                      <p className="font-medium">
                        {new Date(fee.payment_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {fee.payment_proof && (
                    <motion.div 
                      className="mb-3 flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewProofUrl(fee.payment_proof!)}
                        className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Bukti Transfer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadProof(fee.payment_proof!, fee.resident.name, fee.month, fee.year)}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 hover:bg-red-50 text-red-600"
                      onClick={() => handleVerifyPayment(fee.id, 'reject')}
                      disabled={processingId === fee.id}
                    >
                      {processingId === fee.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Tolak
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyPayment(fee.id, 'approve')}
                      disabled={processingId === fee.id}
                    >
                      {processingId === fee.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Setujui
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof Viewer with Spectacular Animations */}
      {viewProofUrl && (
        <ProofViewer
          open={!!viewProofUrl}
          onOpenChange={() => setViewProofUrl(null)}
          imageUrl={viewProofUrl}
          title="Bukti Transfer dari Warga"
          description="Verifikasi bukti transfer sebelum approve/reject"
          downloadFilename={`bukti-transfer-${pendingFees.find(f => f.payment_proof === viewProofUrl)?.resident.name || 'warga'}-${pendingFees.find(f => f.payment_proof === viewProofUrl)?.month || ''}.jpg`}
        />
      )}
    </>
  );
}
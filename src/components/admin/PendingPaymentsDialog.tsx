import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/pending`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingFees(data.fees || []);
      } else {
        toast.error('Gagal mengambil data pembayaran pending');
      }
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            feeId,
            action
          })
        }
      );

      if (response.ok) {
        toast.success(
          action === 'approve' 
            ? 'Pembayaran berhasil disetujui!' 
            : 'Pembayaran ditolak'
        );
        fetchPendingPayments();
        if (onVerificationComplete) {
          onVerificationComplete();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memverifikasi pembayaran');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Gagal memverifikasi pembayaran');
    } finally {
      setProcessingId(null);
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
              {pendingFees.map((fee) => (
                <div key={fee.id} className="border rounded-lg p-4 bg-amber-50">
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
                    <div className="mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewProofUrl(fee.payment_proof!)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat Bukti Transfer
                      </Button>
                    </div>
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
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proof Image Dialog */}
      {viewProofUrl && (
        <Dialog open={!!viewProofUrl} onOpenChange={() => setViewProofUrl(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bukti Transfer</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <img 
                src={viewProofUrl} 
                alt="Bukti Transfer" 
                className="max-w-full max-h-[70vh] rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
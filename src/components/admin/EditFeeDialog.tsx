import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';
import { updateFee } from '../../lib/db-helpers';

interface FeeRecord {
  id: string;
  resident_id: string;
  amount: number;
  description?: string;
  due_date?: string;
}

interface EditFeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: FeeRecord;
  onSuccess: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function EditFeeDialog({ open, onOpenChange, fee, onSuccess }: EditFeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    if (fee) {
      setFormData({
        amount: fee.amount.toString(),
        description: fee.description || '',
        due_date: fee.due_date ? new Date(fee.due_date).toISOString().split('T')[0] : ''
      });
    }
  }, [fee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateFee(fee.id, {
        amount: parseFloat(formData.amount),
        description: formData.description,
        due_date: formData.due_date
      });

      toast.success('Tagihan berhasil diperbarui');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating fee:', error);
      toast.error(error.message || 'Gagal memperbarui tagihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tagihan Iuran</DialogTitle>
          <DialogDescription>Perbarui informasi tagihan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Jumlah Tagihan *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="50000"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Iuran bulanan RT"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
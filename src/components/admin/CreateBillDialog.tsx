import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../../utils/supabase/info';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Resident {
  id: string;
  name: string;
  address: string;
  house_number: string;
}

interface CreateBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function CreateBillDialog({ open, onOpenChange, onSuccess }: CreateBillDialogProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(currentYear.toString());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(false);

  useEffect(() => {
    if (open) {
      fetchResidents();
    }
  }, [open]);

  const fetchResidents = async () => {
    setLoadingResidents(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/residents`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data warga');
      }

      const data = await response.json();
      setResidents(data.residents || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Gagal mengambil data warga');
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResident || !amount || !month || !year) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Jumlah tagihan tidak valid');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid');
        return;
      }

      const requestBody: any = {
        resident_id: selectedResident,
        amount: numAmount,
        month,
        year: parseInt(year)
      };
      
      // Only include description if it has a value
      if (description && description.trim()) {
        requestBody.description = description.trim();
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat tagihan');
      }

      const resident = residents.find(r => r.id === selectedResident);
      toast.success(`Tagihan berhasil dibuat untuk ${resident?.name}`);
      
      // Reset form
      setSelectedResident('');
      setAmount('');
      setDescription('');
      setMonth(months[new Date().getMonth()]);
      setYear(currentYear.toString());
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat tagihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Buat Tagihan Baru</DialogTitle>
          <DialogDescription>
            Buat tagihan iuran untuk warga yang dituju
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resident">Pilih Warga *</Label>
              <Select value={selectedResident} onValueChange={setSelectedResident} disabled={loadingResidents}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingResidents ? "Memuat..." : "Pilih warga"} />
                </SelectTrigger>
                <SelectContent>
                  {residents.map((resident) => (
                    <SelectItem key={resident.id} value={resident.id}>
                      {resident.name} - {resident.address} (No. {resident.house_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Bulan *</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Tahun *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Tagihan (Rp) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Keterangan (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Contoh: Iuran kebersihan bulanan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || loadingResidents}>
              {loading ? 'Membuat...' : 'Buat Tagihan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
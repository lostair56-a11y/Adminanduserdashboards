import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface AddWasteDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
}

const wasteTypes = [
  { value: 'Plastik', price: 3000 },
  { value: 'Kertas', price: 2000 },
  { value: 'Botol Kaca', price: 1500 },
  { value: 'Kaleng', price: 4000 },
  { value: 'Kardus', price: 2500 },
];

interface Resident {
  id: string;
  name: string;
  house_number: string;
}

export function AddWasteDepositDialog({ open, onOpenChange, onAdd }: AddWasteDepositDialogProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    residentId: '',
    wasteType: '',
    weight: 0,
    pricePerKg: 0,
  });

  useEffect(() => {
    if (open) {
      fetchResidents();
    }
  }, [open]);

  const fetchResidents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/residents`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResidents(data.residents || []);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const handleWasteTypeChange = (value: string) => {
    const wasteType = wasteTypes.find((w) => w.value === value);
    setFormData({
      ...formData,
      wasteType: value,
      pricePerKg: wasteType?.price || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sesi berakhir, silakan login kembali');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/wastebank/deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            resident_id: formData.residentId,
            waste_type: formData.wasteType,
            weight: formData.weight,
            price_per_kg: formData.pricePerKg
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Setoran berhasil ditambahkan. Saldo baru: Rp ${data.newBalance.toLocaleString('id-ID')}`);
        setFormData({
          residentId: '',
          wasteType: '',
          weight: 0,
          pricePerKg: 0,
        });
        onAdd();
        onOpenChange(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menambahkan setoran');
      }
    } catch (error) {
      console.error('Error adding deposit:', error);
      toast.error('Terjadi kesalahan saat menambahkan setoran');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = formData.weight * formData.pricePerKg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Setoran Sampah</DialogTitle>
          <DialogDescription>Catat setoran sampah dari warga</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="resident">Nama Warga</Label>
            <Select value={formData.residentId} onValueChange={(value) => setFormData({ ...formData, residentId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih warga" />
              </SelectTrigger>
              <SelectContent>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id}>
                    {resident.name} - Rumah {resident.house_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="wasteType">Jenis Sampah</Label>
            <Select value={formData.wasteType} onValueChange={handleWasteTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis sampah" />
              </SelectTrigger>
              <SelectContent>
                {wasteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.value} - Rp {type.price.toLocaleString('id-ID')}/kg
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Berat (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
          {formData.wasteType && formData.weight > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Nilai</p>
              <p className="text-2xl text-green-600">Rp {totalValue.toLocaleString('id-ID')}</p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Tambah Setoran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
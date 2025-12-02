import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { getResidents, createWasteDeposit } from '../../lib/db-helpers';

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
      const data = await getResidents();
      setResidents(data as any);
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
    
    // Validasi form
    if (!formData.residentId) {
      toast.error('Silakan pilih warga terlebih dahulu');
      return;
    }
    
    if (!formData.wasteType) {
      toast.error('Silakan pilih jenis sampah terlebih dahulu');
      return;
    }
    
    if (formData.weight <= 0) {
      toast.error('Berat sampah harus lebih dari 0 kg');
      return;
    }
    
    setLoading(true);

    try {
      const totalValue = formData.weight * formData.pricePerKg;
      
      await createWasteDeposit({
        resident_id: formData.residentId,
        waste_type: formData.wasteType,
        weight_kg: formData.weight,
        value: totalValue,
        deposit_date: new Date().toISOString()
      });

      toast.success(`Setoran berhasil ditambahkan. Nilai: Rp ${totalValue.toLocaleString('id-ID')}`);
      setFormData({
        residentId: '',
        wasteType: '',
        weight: 0,
        pricePerKg: 0,
      });
      onAdd();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding deposit:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan setoran');
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
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading || !formData.residentId || !formData.wasteType || formData.weight <= 0}
            >
              {loading ? 'Menyimpan...' : 'Tambah Setoran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
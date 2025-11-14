import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddWasteDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (deposit: {
    residentName: string;
    date: string;
    wasteType: string;
    weight: number;
    pricePerKg: number;
  }) => void;
}

const wasteTypes = [
  { value: 'Plastik', price: 3000 },
  { value: 'Kertas', price: 2000 },
  { value: 'Botol Kaca', price: 1500 },
  { value: 'Kaleng', price: 4000 },
  { value: 'Kardus', price: 2500 },
];

export function AddWasteDepositDialog({ open, onOpenChange, onAdd }: AddWasteDepositDialogProps) {
  const [formData, setFormData] = useState({
    residentName: '',
    date: new Date().toISOString().split('T')[0],
    wasteType: '',
    weight: 0,
    pricePerKg: 0,
  });

  const handleWasteTypeChange = (value: string) => {
    const wasteType = wasteTypes.find((w) => w.value === value);
    setFormData({
      ...formData,
      wasteType: value,
      pricePerKg: wasteType?.price || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      residentName: '',
      date: new Date().toISOString().split('T')[0],
      wasteType: '',
      weight: 0,
      pricePerKg: 0,
    });
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
            <Label htmlFor="residentName">Nama Warga</Label>
            <Input
              id="residentName"
              value={formData.residentName}
              onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
              placeholder="Masukkan nama warga"
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
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
            <Button type="submit" className="flex-1">
              Tambah Setoran
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

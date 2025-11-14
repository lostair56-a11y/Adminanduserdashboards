import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AddResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resident: { name: string; address: string; phone: string; joinDate: string }) => void;
}

export function AddResidentDialog({ open, onOpenChange, onAdd }: AddResidentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', address: '', phone: '', joinDate: new Date().toISOString().split('T')[0] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Data Warga</DialogTitle>
          <DialogDescription>Masukkan data warga baru yang akan didaftarkan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Contoh No. 123"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
          </div>
          <div>
            <Label htmlFor="joinDate">Tanggal Bergabung</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Tambah Warga
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

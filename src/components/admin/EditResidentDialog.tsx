import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Resident {
  id: string;
  name: string;
  address: string;
  phone: string;
  joinDate: string;
}

interface EditResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: Resident;
  onSave: (resident: Resident) => void;
}

export function EditResidentDialog({ open, onOpenChange, resident, onSave }: EditResidentDialogProps) {
  const [formData, setFormData] = useState(resident);

  useEffect(() => {
    setFormData(resident);
  }, [resident]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Data Warga</DialogTitle>
          <DialogDescription>Ubah data warga yang sudah terdaftar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-address">Alamat</Label>
            <Input
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Contoh No. 123"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-phone">No. Telepon</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-joinDate">Tanggal Bergabung</Label>
            <Input
              id="edit-joinDate"
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

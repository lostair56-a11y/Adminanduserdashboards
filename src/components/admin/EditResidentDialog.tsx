import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  house_number: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  waste_bank_balance: number;
}

interface EditResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: ResidentProfile;
  onSuccess: () => void;
}

export function EditResidentDialog({ open, onOpenChange, resident, onSuccess }: EditResidentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    house_number: '',
    address: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
  });

  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name,
        email: resident.email,
        phone: resident.phone,
        house_number: resident.house_number,
        address: resident.address,
        rt: resident.rt,
        rw: resident.rw,
        kelurahan: resident.kelurahan,
        kecamatan: resident.kecamatan,
        kota: resident.kota,
      });
    }
  }, [resident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('resident_profiles')
        .update(formData)
        .eq('id', resident.id);

      if (error) throw error;

      toast.success('Data warga berhasil diperbarui');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Gagal memperbarui data warga: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Warga</DialogTitle>
          <DialogDescription>Perbarui informasi warga</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">No. Telepon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div>
              <Label htmlFor="house_number">No. Rumah *</Label>
              <Input
                id="house_number"
                value={formData.house_number}
                onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                placeholder="123"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="rt">RT *</Label>
                <Input
                  id="rt"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  placeholder="003"
                  required
                />
              </div>
              <div>
                <Label htmlFor="rw">RW *</Label>
                <Input
                  id="rw"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  placeholder="005"
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Jl. Contoh No. 123"
                required
              />
            </div>

            <div>
              <Label htmlFor="kelurahan">Kelurahan *</Label>
              <Input
                id="kelurahan"
                value={formData.kelurahan}
                onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                placeholder="Kelurahan"
                required
              />
            </div>

            <div>
              <Label htmlFor="kecamatan">Kecamatan *</Label>
              <Input
                id="kecamatan"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                placeholder="Kecamatan"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="kota">Kota/Kabupaten *</Label>
              <Input
                id="kota"
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                placeholder="Kota"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

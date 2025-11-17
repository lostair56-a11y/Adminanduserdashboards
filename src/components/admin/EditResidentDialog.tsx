import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { supabase } from '../../lib/supabase';
import type { ResidentProfile } from '../../lib/supabase';
import { toast } from 'sonner';

interface EditResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident: ResidentProfile;
  onSuccess: () => void;
}

export function EditResidentDialog({ open, onOpenChange, resident, onSuccess }: EditResidentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    houseNumber: '',
    rt: '',
    rw: '',
    phone: '',
    address: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
  });

  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name,
        houseNumber: resident.house_number,
        rt: resident.rt,
        rw: resident.rw,
        phone: resident.phone,
        address: resident.address,
        kelurahan: resident.kelurahan,
        kecamatan: resident.kecamatan,
        kota: resident.kota,
      });
    }
  }, [resident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('resident_profiles')
        .update({
          name: formData.name,
          house_number: formData.houseNumber,
          rt: formData.rt,
          rw: formData.rw,
          phone: formData.phone,
          address: formData.address,
          kelurahan: formData.kelurahan,
          kecamatan: formData.kecamatan,
          kota: formData.kota,
        })
        .eq('id', resident.id);

      if (error) throw error;

      toast.success('Data warga berhasil diperbarui!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Gagal memperbarui data: ' + error.message);
    } finally {
      setIsLoading(false);
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
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email: {resident.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm">Informasi Personal</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="houseNumber">Nomor Rumah *</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="rt">RT *</Label>
                <Input
                  id="rt"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rw">RW *</Label>
                <Input
                  id="rw"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">No. Telepon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm">Alamat</h3>
            <div>
              <Label htmlFor="address">Alamat Lengkap *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="kelurahan">Kelurahan *</Label>
                <Input
                  id="kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="kecamatan">Kecamatan *</Label>
                <Input
                  id="kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="kota">Kota *</Label>
                <Input
                  id="kota"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

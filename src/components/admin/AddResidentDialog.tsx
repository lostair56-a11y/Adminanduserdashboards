import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProfile } from '../../lib/supabase';

interface AddResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddResidentDialog({ open, onOpenChange, onSuccess }: AddResidentDialogProps) {
  const { profile } = useAuth();
  const adminProfile = profile as AdminProfile;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    houseNumber: '',
    rt: adminProfile?.rt || '',  // Auto-fill dari admin
    rw: adminProfile?.rw || '',  // Auto-fill dari admin
    phone: '',
    address: '',
    kelurahan: adminProfile?.kelurahan || '',  // Auto-fill dari admin
    kecamatan: adminProfile?.kecamatan || '',  // Auto-fill dari admin
    kota: adminProfile?.kota || '',            // Auto-fill dari admin
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.name) newErrors.name = 'Nama wajib diisi';
    if (!formData.houseNumber) newErrors.houseNumber = 'Nomor rumah wajib diisi';
    if (!formData.phone) newErrors.phone = 'Nomor telepon wajib diisi';
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Call server endpoint for resident signup
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/signup/resident`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            houseNumber: formData.houseNumber,
            rt: formData.rt,
            rw: formData.rw,
            phone: formData.phone,
            address: formData.address,
            kelurahan: formData.kelurahan,
            kecamatan: formData.kecamatan,
            kota: formData.kota,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan warga');
      }

      toast.success('Warga berhasil ditambahkan!');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        houseNumber: '',
        rt: adminProfile?.rt || '',
        rw: adminProfile?.rw || '',
        phone: '',
        address: '',
        kelurahan: adminProfile?.kelurahan || '',
        kecamatan: adminProfile?.kecamatan || '',
        kota: adminProfile?.kota || '',
      });
    } catch (error: any) {
      console.error('Error adding resident:', error);
      toast.error('Gagal menambahkan warga: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Data Warga</DialogTitle>
          <DialogDescription>Masukkan data warga baru yang akan didaftarkan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm">Akun Login</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="warga@email.com"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
            </div>
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
                  placeholder="Nama lengkap"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="houseNumber">Nomor Rumah *</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  placeholder="No. 15"
                />
                {errors.houseNumber && <p className="text-xs text-red-600 mt-1">{errors.houseNumber}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="rt">RT *</Label>
                <Input
                  id="rt"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  placeholder="003"
                />
                {errors.rt && <p className="text-xs text-red-600 mt-1">{errors.rt}</p>}
              </div>
              <div>
                <Label htmlFor="rw">RW *</Label>
                <Input
                  id="rw"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  placeholder="005"
                />
                {errors.rw && <p className="text-xs text-red-600 mt-1">{errors.rw}</p>}
              </div>
              <div>
                <Label htmlFor="phone">No. Telepon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
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
                placeholder="Jl. Mawar No. 15"
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="kelurahan">Kelurahan *</Label>
                <Input
                  id="kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  placeholder="Kelurahan"
                />
                {errors.kelurahan && <p className="text-xs text-red-600 mt-1">{errors.kelurahan}</p>}
              </div>
              <div>
                <Label htmlFor="kecamatan">Kecamatan *</Label>
                <Input
                  id="kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  placeholder="Kecamatan"
                />
                {errors.kecamatan && <p className="text-xs text-red-600 mt-1">{errors.kecamatan}</p>}
              </div>
              <div>
                <Label htmlFor="kota">Kota *</Label>
                <Input
                  id="kota"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  placeholder="Kota"
                />
                {errors.kota && <p className="text-xs text-red-600 mt-1">{errors.kota}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Menambahkan...' : 'Tambah Warga'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { BankAccountSettings } from './BankAccountSettings';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { AdminProfile as AdminProfileType } from '../../lib/supabase';
import { toast } from 'sonner';

export function AdminProfile() {
  const { profile, user } = useAuth();
  const adminProfile = profile as AdminProfileType;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (adminProfile) {
      setFormData({
        name: adminProfile.name || '',
        position: adminProfile.position || '',
        phone: adminProfile.phone || '',
        address: adminProfile.address || '',
      });
    }
  }, [adminProfile]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({
          name: formData.name,
          position: formData.position,
          phone: formData.phone,
          address: formData.address,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      // Reload to refresh profile data
      window.location.reload();
    } catch (error: any) {
      toast.error('Gagal memperbarui profil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newPassword = (form.elements.namedItem('new-password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      toast.error('Kata sandi baru tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Kata sandi minimal 6 karakter');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Kata sandi berhasil diubah!');
      form.reset();
    } catch (error: any) {
      toast.error('Gagal mengubah kata sandi: ' + error.message);
    }
  };

  if (!adminProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Admin RT</CardTitle>
          <CardDescription>Informasi personal dan kontak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2>{formData.name}</h2>
              <p className="text-gray-600">{formData.position}</p>
              <p className="text-sm text-gray-500 mt-1">RT {adminProfile.rt} / RW {adminProfile.rw}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="position">Jabatan</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={adminProfile.email}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              <div>
                <Label htmlFor="phone">No. Telepon</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1" disabled={isLoading}>
                    Batal
                  </Button>
                  <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <BankAccountSettings />

      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Ubah kata sandi akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Kata Sandi Baru</Label>
              <Input id="new-password" name="new-password" type="password" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
              <Input id="confirm-password" name="confirm-password" type="password" className="mt-1" required />
            </div>
            <Button type="submit" className="w-full">Ubah Kata Sandi</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

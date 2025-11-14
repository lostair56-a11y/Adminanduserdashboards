import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { BankAccountSettings } from './BankAccountSettings';

export function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Ahmad Fauzi',
    position: 'Ketua RT 003',
    email: 'admin.rt003@email.com',
    phone: '081234567890',
    address: 'Jl. Mawar Indah No. 1, RW 005',
  });

  const handleSave = () => {
    // Save to backend
    alert('Profil berhasil diperbarui!');
    setIsEditing(false);
  };

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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
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
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Batal
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Perubahan
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
              <Input id="current-password" type="password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-password">Kata Sandi Baru</Label>
              <Input id="new-password" type="password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
              <Input id="confirm-password" type="password" className="mt-1" />
            </div>
            <Button className="w-full">Ubah Kata Sandi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
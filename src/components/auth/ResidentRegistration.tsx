import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Home, Users } from 'lucide-react';

interface ResidentRegistrationProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function ResidentRegistration({ onSuccess, onBack }: ResidentRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    houseNumber: '',
    rt: '',
    rw: '',
    email: '',
    phone: '',
    address: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.houseNumber) newErrors.houseNumber = 'Nomor rumah wajib diisi';
    if (!formData.rt) newErrors.rt = 'RT wajib diisi';
    if (!formData.rw) newErrors.rw = 'RW wajib diisi';
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,13}$/.test(formData.phone)) {
      newErrors.phone = 'Nomor telepon tidak valid';
    }
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    if (!formData.kelurahan) newErrors.kelurahan = 'Kelurahan wajib diisi';
    if (!formData.kecamatan) newErrors.kecamatan = 'Kecamatan wajib diisi';
    if (!formData.kota) newErrors.kota = 'Kota wajib diisi';
    if (!formData.password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // In real app, send data to backend
      console.log('Resident Registration Data:', formData);
      onSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Pendaftaran Warga</CardTitle>
                <CardDescription>Daftar sebagai warga RT</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm mb-3">Informasi Personal</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="houseNumber">Nomor Rumah *</Label>
                    <div className="relative mt-1">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="houseNumber"
                        value={formData.houseNumber}
                        onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                        className="pl-10"
                        placeholder="Contoh: No. 15"
                      />
                    </div>
                    {errors.houseNumber && (
                      <p className="text-xs text-red-600 mt-1">{errors.houseNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="rt">RT *</Label>
                    <Input
                      id="rt"
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      placeholder="003"
                      className="mt-1"
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
                      className="mt-1"
                    />
                    {errors.rw && <p className="text-xs text-red-600 mt-1">{errors.rw}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm mb-3">Informasi Kontak</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        placeholder="warga@email.com"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">No. Telepon *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        placeholder="081234567890"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-sm mb-3">Informasi Alamat</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Alamat Lengkap *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10"
                        placeholder="Jl. Mawar No. 15"
                      />
                    </div>
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
                        className="mt-1"
                      />
                      {errors.kelurahan && (
                        <p className="text-xs text-red-600 mt-1">{errors.kelurahan}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="kecamatan">Kecamatan *</Label>
                      <Input
                        id="kecamatan"
                        value={formData.kecamatan}
                        onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                        placeholder="Kecamatan"
                        className="mt-1"
                      />
                      {errors.kecamatan && (
                        <p className="text-xs text-red-600 mt-1">{errors.kecamatan}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="kota">Kota *</Label>
                      <Input
                        id="kota"
                        value={formData.kota}
                        onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                        placeholder="Kota"
                        className="mt-1"
                      />
                      {errors.kota && <p className="text-xs text-red-600 mt-1">{errors.kota}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div>
                <h3 className="text-sm mb-3">Keamanan Akun</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="password">Kata Sandi *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        placeholder="Ulangi kata sandi"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button type="submit" className="w-full" size="lg">
                  Daftar sebagai Warga
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

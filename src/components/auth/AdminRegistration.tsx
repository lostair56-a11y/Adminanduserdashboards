import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, User, Mail, Phone, MapPin, Lock, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRegistrationProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminRegistration({ onSuccess, onBack }: AdminRegistrationProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    address: '',
    rt: '',
    rw: '',
    briAccountNumber: '',
    briAccountName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.position) newErrors.position = 'Jabatan wajib diisi';
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
    if (!formData.rt) newErrors.rt = 'RT wajib diisi';
    if (!formData.rw) newErrors.rw = 'RW wajib diisi';
    if (!formData.briAccountNumber) {
      newErrors.briAccountNumber = 'Nomor rekening BRI wajib diisi';
    } else if (!/^[0-9]{10,16}$/.test(formData.briAccountNumber)) {
      newErrors.briAccountNumber = 'Nomor rekening tidak valid';
    }
    if (!formData.briAccountName) newErrors.briAccountName = 'Nama pemilik rekening wajib diisi';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateForm()) {
      try {
        await signUp(formData.email, formData.password, 'admin', formData);
        onSuccess();
      } catch (error: any) {
        alert('Pendaftaran gagal: ' + (error.message || 'Terjadi kesalahan'));
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Pendaftaran Admin RT</CardTitle>
                <CardDescription>Daftar sebagai pengurus/admin RT</CardDescription>
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
                    <Label htmlFor="position">Jabatan *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="pl-10"
                        placeholder="Contoh: Ketua RT"
                      />
                    </div>
                    {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position}</p>}
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
                        placeholder="admin@email.com"
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
                        placeholder="Jl. Contoh No. 1"
                      />
                    </div>
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label htmlFor="rt">RT *</Label>
                      <Input
                        id="rt"
                        value={formData.rt}
                        onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                        placeholder="001"
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
              </div>

              {/* Bank Account Information */}
              <div>
                <h3 className="text-sm mb-3">Informasi Rekening Bank BRI</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Rekening ini akan digunakan untuk menerima pembayaran iuran warga
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="briAccountNumber">Nomor Rekening BRI *</Label>
                    <div className="relative mt-1">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="briAccountNumber"
                        value={formData.briAccountNumber}
                        onChange={(e) => setFormData({ ...formData, briAccountNumber: e.target.value })}
                        className="pl-10"
                        placeholder="1234567890123456"
                      />
                    </div>
                    {errors.briAccountNumber && (
                      <p className="text-xs text-red-600 mt-1">{errors.briAccountNumber}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="briAccountName">Nama Pemilik Rekening *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="briAccountName"
                        value={formData.briAccountName}
                        onChange={(e) => setFormData({ ...formData, briAccountName: e.target.value })}
                        className="pl-10"
                        placeholder="Nama sesuai rekening"
                      />
                    </div>
                    {errors.briAccountName && (
                      <p className="text-xs text-red-600 mt-1">{errors.briAccountName}</p>
                    )}
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
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Mendaftar...' : 'Daftar sebagai Admin RT'}
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
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building2, CreditCard, User, Save, Eye, EyeOff } from 'lucide-react';

export function BankAccountSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [formData, setFormData] = useState({
    bankName: 'Bank BRI',
    accountNumber: '1234567890123456',
    accountName: 'RT 003 KELURAHAN MAWAR',
  });

  const handleSave = () => {
    // Save to backend
    alert('Informasi rekening berhasil diperbarui!');
    setIsEditing(false);
  };

  const maskAccountNumber = (number: string) => {
    if (showAccountNumber) return number;
    const visible = number.slice(-4);
    const masked = '*'.repeat(number.length - 4);
    return masked + visible;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekening Bank BRI untuk Iuran</CardTitle>
        <CardDescription>
          Rekening ini akan digunakan untuk menerima pembayaran iuran dari warga
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-700">Bank Penerima</p>
                <p className="text-lg">{formData.bankName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-700 mb-1">Nomor Rekening</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl tracking-wider flex-1">
                    {maskAccountNumber(formData.accountNumber)}
                  </p>
                  <button
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="p-2 hover:bg-blue-200 rounded transition-colors"
                  >
                    {showAccountNumber ? (
                      <EyeOff className="h-4 w-4 text-blue-700" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-700" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Nama Pemilik Rekening</p>
                <p className="text-lg">{formData.accountName}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Nama Bank</Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="pl-10"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Bank tidak dapat diubah (Bank BRI)</p>
              </div>

              <div>
                <Label htmlFor="accountNumber">Nomor Rekening</Label>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="pl-10"
                    placeholder="1234567890123456"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="pl-10"
                    placeholder="Nama sesuai rekening"
                  />
                </div>
              </div>
            </div>
          )}

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
                Edit Informasi Rekening
              </Button>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Catatan:</strong> Pastikan informasi rekening akurat. Warga akan melakukan
              transfer ke rekening ini untuk membayar iuran bulanan.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

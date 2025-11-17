import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Building2, CreditCard, User, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { AdminProfile as AdminProfileType } from '../../lib/supabase';
import { toast } from 'sonner';

export function BankAccountSettings() {
  const { profile, user } = useAuth();
  const adminProfile = profile as AdminProfileType;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
  });

  useEffect(() => {
    if (adminProfile) {
      setFormData({
        accountNumber: adminProfile.bri_account_number || '',
        accountName: adminProfile.bri_account_name || '',
      });
    }
  }, [adminProfile]);

  const handleSave = async () => {
    if (!user) return;
    
    if (!/^[0-9]{10,16}$/.test(formData.accountNumber)) {
      toast.error('Nomor rekening tidak valid');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({
          bri_account_number: formData.accountNumber,
          bri_account_name: formData.accountName,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Informasi rekening berhasil diperbarui!');
      setIsEditing(false);
      
      // Reload to refresh profile data
      window.location.reload();
    } catch (error: any) {
      toast.error('Gagal memperbarui rekening: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const maskAccountNumber = (number: string) => {
    if (showAccountNumber) return number;
    const visible = number.slice(-4);
    const masked = '*'.repeat(number.length - 4);
    return masked + visible;
  };

  if (!adminProfile) {
    return null;
  }

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
                <p className="text-lg">Bank BRI</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-700 mb-1">Nomor Rekening</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl tracking-wider flex-1">
                    {formData.accountNumber ? maskAccountNumber(formData.accountNumber) : 'Belum diatur'}
                  </p>
                  {formData.accountNumber && (
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
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-700 mb-1">Nama Pemilik Rekening</p>
                <p className="text-lg">{formData.accountName || 'Belum diatur'}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountNumber">Nomor Rekening BRI</Label>
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

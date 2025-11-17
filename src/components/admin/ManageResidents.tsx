import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Search, Edit, Trash2, Mail, Phone, Home, Wallet } from 'lucide-react';
import { AddResidentDialog } from './AddResidentDialog';
import { EditResidentDialog } from './EditResidentDialog';
import { supabase } from '../../lib/supabase';
import type { ResidentProfile } from '../../lib/supabase';
import { toast } from 'sonner';

export function ManageResidents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentProfile | null>(null);
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('resident_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResidents(data || []);
    } catch (error: any) {
      toast.error('Gagal memuat data warga: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.house_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (resident: ResidentProfile) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data warga "${resident.name}"? Ini akan menghapus semua data terkait termasuk pembayaran dan riwayat bank sampah.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resident_profiles')
        .delete()
        .eq('id', resident.id);

      if (error) throw error;

      toast.success('Data warga berhasil dihapus');
      loadResidents();
    } catch (error: any) {
      toast.error('Gagal menghapus data warga: ' + error.message);
    }
  };

  if (loading) {
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Warga Terdaftar</CardTitle>
              <CardDescription>Kelola data seluruh warga RT ({residents.length} warga)</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Warga
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, alamat, atau nomor rumah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>No. Rumah</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Saldo Bank Sampah</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-12 w-12 text-gray-300" />
                        {searchQuery ? (
                          <p>Tidak ada warga yang cocok dengan pencarian "{searchQuery}"</p>
                        ) : (
                          <div>
                            <p>Belum ada warga terdaftar</p>
                            <Button
                              variant="link"
                              onClick={() => setShowAddDialog(true)}
                              className="mt-2"
                            >
                              Tambah Warga Pertama
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>
                        <div>
                          <p>{resident.name}</p>
                          <p className="text-xs text-gray-500">
                            RT {resident.rt} / RW {resident.rw}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-gray-400" />
                          {resident.house_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {resident.phone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {resident.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={resident.address}>
                          {resident.address}
                        </div>
                        <p className="text-xs text-gray-500">
                          {resident.kelurahan}, {resident.kecamatan}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Rp {(resident.waste_bank_balance || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingResident(resident)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(resident)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddResidentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadResidents}
      />

      {editingResident && (
        <EditResidentDialog
          open={!!editingResident}
          onOpenChange={(open) => !open && setEditingResident(null)}
          resident={editingResident}
          onSuccess={loadResidents}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { AddResidentDialog } from './AddResidentDialog';
import { EditResidentDialog } from './EditResidentDialog';
import { ResidentDebugInfo } from './ResidentDebugInfo';
import { SessionDebugger } from './SessionDebugger';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Search, UserPlus, Edit, Trash2, Loader2, Home, Phone, Mail, Wallet, AlertTriangle, Bug } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

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
  created_at?: string;
}

export function ManageResidents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentProfile | null>(null);
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteResident, setDeleteResident] = useState<ResidentProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        toast.error('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      console.log('Fetching residents with token:', session.access_token.substring(0, 20) + '...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/residents`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Residents response status:', response.status);

      if (response.status === 401) {
        // Unauthorized - token expired or invalid
        console.error('Unauthorized: Token invalid or expired');
        toast.error('Sesi kedaluwarsa. Silakan login kembali.');
        // Clear session and redirect
        await supabase.auth.signOut();
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Fetch residents error:', error);
        throw new Error(error.error || 'Gagal mengambil data warga');
      }

      const data = await response.json();
      console.log('Residents data:', data);
      setResidents(data.residents || []);
    } catch (error: any) {
      console.error('Error fetching residents:', error);
      toast.error(error.message || 'Gagal mengambil data warga');
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
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Sesi tidak valid. Silakan login kembali.');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/residents/${resident.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menghapus data warga');
      }

      toast.success(`Data warga "${resident.name}" berhasil dihapus`);
      setDeleteResident(null);
      loadResidents();
    } catch (error: any) {
      console.error('Error deleting resident:', error);
      toast.error(error.message || 'Gagal menghapus data warga');
    } finally {
      setDeleting(false);
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
      {/* Session Debugger - Always show for troubleshooting */}
      <SessionDebugger />
      
      {/* Debug Info - Hanya tampil jika tidak ada warga */}
      {residents.length === 0 && !loading && (
        <ResidentDebugInfo />
      )}
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Data Warga Terdaftar</CardTitle>
              <CardDescription>Kelola data seluruh warga RT ({residents.length} warga)</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
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
                            onClick={() => setDeleteResident(resident)}
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

      {deleteResident && (
        <AlertDialog open={!!deleteResident} onOpenChange={(open) => !open && setDeleteResident(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data Warga</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data warga "{deleteResident.name}"? Ini akan menghapus semua data terkait termasuk pembayaran dan riwayat bank sampah.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(deleteResident)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
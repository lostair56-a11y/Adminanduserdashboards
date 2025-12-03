import { useState, useEffect } from 'react';
import { AnimatedCard as Card, AnimatedCardContent as CardContent, AnimatedCardDescription as CardDescription, AnimatedCardHeader as CardHeader, AnimatedCardTitle as CardTitle } from '../ui/animated-card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Plus, Edit, Trash2, Home, Phone, Mail, Wallet, Loader2 } from 'lucide-react';
import { AddResidentDialog } from './AddResidentDialog';
import { EditResidentDialog } from './EditResidentDialog';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase';
import { getResidents } from '../../lib/db-helpers';
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
import { motion, AnimatePresence } from 'motion/react';
import { LoadingSkeleton } from '../animations/LoadingSkeleton';

interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  house_number: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  waste_bank_balance?: number;
}

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'sinnmqksjnvsvwnodogr';

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
    console.log('🔄 Loading residents...');
    setLoading(true);
    try {
      const data = await getResidents();
      console.log('✅ Residents loaded:', data.length, 'warga');
      setResidents(data as any);
    } catch (error: any) {
      console.error('❌ Error fetching residents:', error);
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
      const { error } = await supabase
        .from('resident_profiles')
        .delete()
        .eq('id', resident.id);

      if (error) throw error;

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
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Data Warga</CardTitle>
          <CardDescription>Kelola data warga RT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoadingSkeleton variant="input" />
            <LoadingSkeleton variant="card" count={3} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card delay={0}>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <CardTitle>Data Warga Terdaftar</CardTitle>
              <CardDescription>Kelola data seluruh warga RT ({residents.length} warga)</CardDescription>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Warga
              </Button>
            </motion.div>
          </motion.div>
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
                  <AnimatePresence mode="popLayout">
                    {filteredResidents.map((resident, index) => (
                      <motion.tr
                        key={resident.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        layout
                      >
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
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingResident(resident)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteResident(resident)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
          onOpenChange={(open) => {
            if (!open) {
              setEditingResident(null);
            }
          }}
          resident={editingResident}
          onSuccess={async () => {
            console.log('🔄 Edit success, reloading residents...');
            await loadResidents();
            console.log('✅ Residents reloaded');
          }}
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
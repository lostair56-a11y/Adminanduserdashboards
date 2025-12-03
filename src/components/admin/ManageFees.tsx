import { CreateBillDialog } from './CreateBillDialog';
import { EditFeeDialog } from './EditFeeDialog';
import { PendingPaymentsDialog } from './PendingPaymentsDialog';
import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { getResidents, getFees, deleteFee } from '../../lib/db-helpers';
import { projectId } from '../../utils/supabase/info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, CheckCircle, XCircle, Bell, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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

interface FeeRecord {
  id: string;
  resident_id: string;
  amount: number;
  status: 'paid' | 'unpaid';
  payment_date?: string;
  payment_method?: string;
  description?: string;
  due_date?: string;
  resident?: {
    name: string;
    house_number: string;
    phone: string;
  };
}

interface Resident {
  id: string;
  name: string;
  address: string;
}

export function ManageFees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [deletingFee, setDeletingFee] = useState<FeeRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [residentsData, feesData] = await Promise.all([
        getResidents(),
        getFees()
      ]);
      
      setResidents(residentsData as any);
      setFeeRecords(feesData as any);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getResidentName = (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    return resident?.name || 'Unknown';
  };

  const getResidentAddress = (residentId: string) => {
    const resident = residents.find(r => r.id === residentId);
    return resident?.address || '-';
  };

  const filteredRecords = feeRecords.filter((record) => {
    const residentName = getResidentName(record.resident_id);
    const residentAddress = getResidentAddress(record.resident_id);
    return (
      residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      residentAddress.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPaid = feeRecords.filter((r) => r.status === 'paid').length;
  const totalUnpaid = feeRecords.filter((r) => r.status === 'unpaid').length;
  const totalAmount = feeRecords.reduce(
    (sum, r) => sum + (r.status === 'paid' ? r.amount : 0),
    0
  );

  const sendReminder = async (residentId: string, feeId: string) => {
    try {
      const accessToken = localStorage.getItem('sb-access-token');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          resident_id: residentId,
          fee_id: feeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      const residentName = getResidentName(residentId);
      toast.success(`Pengingat pembayaran telah dikirim ke ${residentName}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Gagal mengirim pengingat');
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    setLoading(true);
    try {
      await deleteFee(feeId);
      toast.success('Tagihan berhasil dihapus');
      fetchData();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Gagal menghapus tagihan');
    } finally {
      setLoading(false);
      setDeletingFee(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Terkumpul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {totalAmount.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">Periode berjalan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sudah Bayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalPaid} Tagihan</div>
            <p className="text-xs text-gray-600 mt-1">
              {feeRecords.length > 0 ? ((totalPaid / feeRecords.length) * 100).toFixed(0) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Belum Bayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{totalUnpaid} Tagihan</div>
            <p className="text-xs text-gray-600 mt-1">
              {feeRecords.length > 0 ? ((totalUnpaid / feeRecords.length) * 100).toFixed(0) : 0}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Status Pembayaran Iuran</CardTitle>
              <CardDescription>Daftar pembayaran iuran warga</CardDescription>
            </div>
            <Button onClick={() => setShowCreateBill(true)} className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Buat Tagihan Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, alamat, atau bulan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Belum ada data tagihan</p>
              <p className="text-sm mt-2">Klik tombol "Buat Tagihan Baru" untuk menambahkan tagihan</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Warga</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Bayar</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getResidentName(record.resident_id)}</TableCell>
                      <TableCell>{getResidentAddress(record.resident_id)}</TableCell>
                      <TableCell>Rp {record.amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'paid' ? 'default' : 'destructive'} className="gap-1">
                          {record.status === 'paid' ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Lunas
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Belum Bayar
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.payment_date
                          ? new Date(record.payment_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>{record.payment_method || '-'}</TableCell>
                      <TableCell className="text-right">
                        {record.status === 'unpaid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendReminder(record.resident_id, record.id)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Kirim Pengingat
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFee(record)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingFee(record)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateBillDialog
        open={showCreateBill}
        onOpenChange={setShowCreateBill}
        onSuccess={fetchData}
      />

      <PendingPaymentsDialog
        open={showPendingPayments}
        onOpenChange={setShowPendingPayments}
        onVerificationComplete={fetchData}
      />

      {editingFee && (
        <EditFeeDialog
          open={!!editingFee}
          onOpenChange={(open) => !open && setEditingFee(null)}
          fee={editingFee}
          onSuccess={fetchData}
        />
      )}

      <AlertDialog open={deletingFee !== null} onOpenChange={() => setDeletingFee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tagihan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tagihan ini? Tindakan ini tidak dapat diurungkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak, batalkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingFee) {
                  handleDeleteFee(deletingFee.id);
                }
              }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ya, hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
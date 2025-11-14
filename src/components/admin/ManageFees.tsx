import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Search, Bell, CheckCircle, XCircle } from 'lucide-react';

interface FeeRecord {
  id: string;
  residentName: string;
  address: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paidDate?: string;
  paymentMethod?: string;
}

export function ManageFees() {
  const [searchQuery, setSearchQuery] = useState('');

  // Empty initial state - data will be fetched from backend
  const feeRecords: FeeRecord[] = [];

  const filteredRecords = feeRecords.filter(
    (record) =>
      record.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = feeRecords.filter((r) => r.status === 'paid').length;
  const totalUnpaid = feeRecords.filter((r) => r.status === 'unpaid').length;
  const totalAmount = feeRecords.reduce(
    (sum, r) => sum + (r.status === 'paid' ? r.amount : 0),
    0
  );

  const sendReminder = (residentName: string) => {
    alert(`Pengingat pembayaran telah dikirim ke ${residentName}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Terkumpul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {totalAmount.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">November 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sudah Bayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalPaid} Warga</div>
            <p className="text-xs text-gray-600 mt-1">
              {((totalPaid / feeRecords.length) * 100).toFixed(0)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Belum Bayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{totalUnpaid} Warga</div>
            <p className="text-xs text-gray-600 mt-1">
              {((totalUnpaid / feeRecords.length) * 100).toFixed(0)}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pembayaran Iuran</CardTitle>
          <CardDescription>Daftar pembayaran iuran bulanan warga</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau alamat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
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
                    <TableCell>{record.residentName}</TableCell>
                    <TableCell>{record.address}</TableCell>
                    <TableCell>Rp {record.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'paid' ? 'default' : 'destructive'}>
                        {record.status === 'paid' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Belum Bayar
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.paidDate
                        ? new Date(record.paidDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>{record.paymentMethod || '-'}</TableCell>
                    <TableCell className="text-right">
                      {record.status === 'unpaid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReminder(record.residentName)}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          Kirim Pengingat
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
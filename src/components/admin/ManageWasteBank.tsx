import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus } from 'lucide-react';
import { AddWasteDepositDialog } from './AddWasteDepositDialog';

interface WasteDeposit {
  id: string;
  residentName: string;
  date: string;
  wasteType: string;
  weight: number;
  pricePerKg: number;
  totalValue: number;
}

export function ManageWasteBank() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Empty initial state - data will be fetched from backend
  const [deposits, setDeposits] = useState<WasteDeposit[]>([]);

  const totalWeight = deposits.reduce((sum, d) => sum + d.weight, 0);
  const totalValue = deposits.reduce((sum, d) => sum + d.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Setoran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{deposits.length} Transaksi</div>
            <p className="text-xs text-gray-600 mt-1">November 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Berat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalWeight} kg</div>
            <p className="text-xs text-gray-600 mt-1">Semua jenis sampah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {totalValue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">Nilai ekonomi</p>
          </CardContent>
        </Card>
      </div>

      {/* Deposits Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Setoran Sampah</CardTitle>
              <CardDescription>Daftar setoran bank sampah dari warga</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Setoran
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Warga</TableHead>
                  <TableHead>Jenis Sampah</TableHead>
                  <TableHead>Berat (kg)</TableHead>
                  <TableHead>Harga/kg</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      {new Date(deposit.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{deposit.residentName}</TableCell>
                    <TableCell>{deposit.wasteType}</TableCell>
                    <TableCell>{deposit.weight} kg</TableCell>
                    <TableCell>Rp {deposit.pricePerKg.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      Rp {deposit.totalValue.toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddWasteDepositDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(deposit) => {
          setDeposits([
            {
              ...deposit,
              id: Date.now().toString(),
              totalValue: deposit.weight * deposit.pricePerKg,
            },
            ...deposits,
          ]);
          setShowAddDialog(false);
        }}
      />
    </div>
  );
}
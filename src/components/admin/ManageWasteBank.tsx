import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus } from 'lucide-react';
import { AddWasteDepositDialog } from './AddWasteDepositDialog';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';

interface WasteDeposit {
  id: string;
  resident_id: string;
  waste_type: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
  date: string;
  resident?: {
    name: string;
    house_number: string;
  };
}

interface WasteBankStats {
  totalTransactions: number;
  totalWeight: number;
  totalValue: number;
  month: string;
}

export function ManageWasteBank() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deposits, setDeposits] = useState<WasteDeposit[]>([]);
  const [stats, setStats] = useState<WasteBankStats>({
    totalTransactions: 0,
    totalWeight: 0,
    totalValue: 0,
    month: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  });
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    await Promise.all([fetchDeposits(), fetchStats()]);
    setLoading(false);
  };

  const fetchDeposits = async () => {
    try {
      if (!session?.access_token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/wastebank/deposits`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const actualDeposits = (data.deposits || []).filter((d: WasteDeposit) => d.total_value > 0);
        setDeposits(actualDeposits);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (!session?.access_token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/wastebank/stats`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Setoran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalTransactions} Transaksi</div>
            <p className="text-xs text-gray-600 mt-1">{stats.month}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Berat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalWeight.toFixed(1)} kg</div>
            <p className="text-xs text-gray-600 mt-1">Semua jenis sampah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {stats.totalValue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">Nilai ekonomi</p>
          </CardContent>
        </Card>
      </div>

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
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada setoran sampah</div>
          ) : (
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
                      <TableCell>{deposit.resident?.name || 'Unknown'}</TableCell>
                      <TableCell>{deposit.waste_type}</TableCell>
                      <TableCell>{deposit.weight} kg</TableCell>
                      <TableCell>Rp {deposit.price_per_kg.toLocaleString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        Rp {deposit.total_value.toLocaleString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddWasteDepositDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={fetchData}
      />
    </div>
  );
}
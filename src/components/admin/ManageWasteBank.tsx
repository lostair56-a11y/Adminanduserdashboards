import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Leaf, TrendingUp, Weight } from 'lucide-react';
import { AddWasteDepositDialog } from './AddWasteDepositDialog';
import { useAuth } from '../../contexts/AuthContext';
import { getWasteDeposits } from '../../lib/db-helpers';
import { motion } from 'motion/react';
import { AnimatedCard } from '../animations/AnimatedCard';
import { FloatingElement } from '../animations/FloatingElement';
import { StaggerContainer, StaggerItem } from '../animations/StaggerContainer';

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

      const data = await getWasteDeposits();
      // Filter only actual deposits (positive values), not payments
      const actualDeposits = data.filter((d: WasteDeposit) => d.total_value > 0);
      setDeposits(actualDeposits as any);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const fetchStats = async () => {
    try {
      if (!session?.access_token) return;

      const data = await getWasteDeposits();
      
      // Calculate stats for current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const monthlyDeposits = data.filter((d: WasteDeposit) => {
        const depositMonth = d.date.substring(0, 7); // Get YYYY-MM
        return depositMonth === currentMonth && d.total_value > 0;
      });

      setStats({
        totalTransactions: monthlyDeposits.length,
        totalWeight: monthlyDeposits.reduce((sum, d) => sum + Number(d.weight), 0),
        totalValue: monthlyDeposits.reduce((sum, d) => sum + Number(d.total_value), 0),
        month: now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <StaggerContainer className="grid gap-6 md:grid-cols-3">
        <StaggerItem>
          <AnimatedCard variant="bounce" delay={0.1}>
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FloatingElement duration={2}>
                    <Leaf className="h-5 w-5 text-green-500" />
                  </FloatingElement>
                  Total Setoran Bulan Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl"
                  animate={{ 
                    scale: [1, 1.08, 1],
                    color: ['#000', '#22c55e', '#000']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {stats.totalTransactions} Transaksi
                </motion.div>
                <motion.p 
                  className="text-xs text-gray-600 mt-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stats.month}
                </motion.p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard variant="bounce" delay={0.2}>
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-t-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FloatingElement duration={2.5} delay={0.3}>
                    <Weight className="h-5 w-5 text-blue-500" />
                  </FloatingElement>
                  Total Berat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    textShadow: [
                      '0 0 10px rgba(59, 130, 246, 0)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 10px rgba(59, 130, 246, 0)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {stats.totalWeight.toFixed(1)} kg
                </motion.div>
                <p className="text-xs text-gray-600 mt-1">Semua jenis sampah</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard variant="bounce" delay={0.3}>
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FloatingElement duration={2} delay={0.5}>
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                  </FloatingElement>
                  Total Nilai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl"
                  animate={{ 
                    scale: [1, 1.12, 1],
                    textShadow: [
                      '0 0 10px rgba(245, 158, 11, 0)',
                      '0 0 25px rgba(245, 158, 11, 0.6)',
                      '0 0 10px rgba(245, 158, 11, 0)'
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Rp {stats.totalValue.toLocaleString('id-ID')}
                </motion.div>
                <motion.p 
                  className="text-xs text-gray-600 mt-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Nilai ekonomi
                </motion.p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      <AnimatedCard variant="scale" delay={0.4}>
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FloatingElement duration={3}>
                    <Leaf className="h-5 w-5 text-green-500" />
                  </FloatingElement>
                  Riwayat Setoran Sampah
                </CardTitle>
                <CardDescription>Daftar setoran bank sampah dari warga</CardDescription>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => setShowAddDialog(true)} className="shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Setoran
                </Button>
              </motion.div>
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
      </AnimatedCard>

      <AddWasteDepositDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={fetchData}
      />
    </div>
  );
}
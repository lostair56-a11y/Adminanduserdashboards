import { useState, useEffect } from 'react';
import { AnimatedCard as Card, AnimatedCardContent as CardContent, AnimatedCardDescription as CardDescription, AnimatedCardHeader as CardHeader, AnimatedCardTitle as CardTitle } from '../ui/animated-card';
import { DollarSign, Users, Leaf, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { StaggerContainer, StaggerItem } from '../animations/PageTransition';

export function StatsOverview() {
  const { user, profile, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFees: 0,
    totalResidents: 0,
    totalWasteBankBalance: 0,
    paidCount: 0,
    unpaidCount: 0,
    participationRate: 0,
  });

  useEffect(() => {
    if (user && profile && userRole === 'admin') {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user, profile, userRole]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      if (!user || userRole !== 'admin' || !profile) {
        setLoading(false);
        return;
      }

      const adminProfile = profile as any;

      if (!adminProfile.rt || !adminProfile.rw) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentMonth = now.toLocaleDateString('id-ID', { month: 'long' });
      const currentYear = now.getFullYear();

      const { data: residents, count: residentsCount } = await supabase
        .from('resident_profiles')
        .select('id, waste_bank_balance', { count: 'exact' })
        .eq('rt', adminProfile.rt)
        .eq('rw', adminProfile.rw);

      const residentIds = residents?.map(r => r.id) || [];

      if (residentIds.length === 0) {
        setStats({
          totalFees: 0,
          totalResidents: 0,
          totalWasteBankBalance: 0,
          paidCount: 0,
          unpaidCount: 0,
          participationRate: 0,
        });
        setLoading(false);
        return;
      }

      const { data: payments } = await supabase
        .from('fee_payments')
        .select('id, resident_id, amount, month, year, status, payment_date, payment_method, created_at')
        .in('resident_id', residentIds)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      const paidPayments = payments?.filter(p => p.status === 'paid') || [];
      const unpaidPayments = payments?.filter(p => p.status === 'unpaid') || [];

      const totalFees = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const totalWasteBankBalance = residents?.reduce((sum, r) => sum + (r.waste_bank_balance || 0), 0) || 0;

      const { count: depositsCount } = await supabase
        .from('waste_deposits')
        .select('resident_id', { count: 'exact', head: true })
        .in('resident_id', residentIds)
        .gte('date', `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);

      const participationRate = residentsCount ? Math.round((depositsCount || 0) / residentsCount * 100) : 0;

      setStats({
        totalFees,
        totalResidents: residentsCount || 0,
        totalWasteBankBalance,
        paidCount: paidPayments.length,
        unpaidCount: unpaidPayments.length,
        participationRate,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusData = [
    { name: 'Lunas', value: stats.paidCount, count: stats.paidCount },
    { name: 'Belum Bayar', value: stats.unpaidCount, count: stats.unpaidCount },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-b-2 border-blue-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card delay={0}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Iuran Terkumpul</CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <DollarSign className="h-4 w-4 text-gray-600" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl"
              >
                Rp {stats.totalFees.toLocaleString('id-ID')}
              </motion.div>
              <p className="text-xs text-gray-600 mt-1">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card delay={0.1}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Warga Terdaftar</CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Users className="h-4 w-4 text-gray-600" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl"
              >
                {stats.totalResidents} KK
              </motion.div>
              <p className="text-xs text-gray-600 mt-1">Total kepala keluarga</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card delay={0.2}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Saldo Bank Sampah</CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Leaf className="h-4 w-4 text-gray-600" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl"
              >
                Rp {stats.totalWasteBankBalance.toLocaleString('id-ID')}
              </motion.div>
              <p className="text-xs text-gray-600 mt-1">Semua warga</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card delay={0.3}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Partisipasi Bank Sampah</CardTitle>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                <TrendingUp className="h-4 w-4 text-gray-600" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl"
              >
                {stats.participationRate}%
              </motion.div>
              <p className="text-xs text-gray-600 mt-1">Bulan ini</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Status Pie Chart */}
        <Card delay={0.4}>
          <CardHeader>
            <CardTitle>Status Pembayaran Warga</CardTitle>
            <CardDescription>Persentase pembayaran iuran bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.paidCount === 0 && stats.unpaidCount === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada data pembayaran</p>
                  <p className="text-xs mt-1">Tambahkan warga dan tagihan untuk melihat statistik</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card delay={0.5}>
          <CardHeader>
            <CardTitle>Ringkasan Bulan Ini</CardTitle>
            <CardDescription>Informasi penting RT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pembayaran Lunas</p>
                    <p className="text-lg">{stats.paidCount} Warga</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Belum Bayar</p>
                    <p className="text-lg">{stats.unpaidCount} Warga</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Partisipasi Bank Sampah</p>
                    <p className="text-lg">{stats.participationRate}% Warga</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

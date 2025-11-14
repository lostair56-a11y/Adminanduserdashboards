import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, Users, Leaf, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function StatsOverview() {
  // Data will be fetched from backend
  const totalFees = 0;
  const paymentStatusData = [
    { name: 'Lunas', value: 0, count: 0 },
    { name: 'Belum Bayar', value: 0, count: 0 },
  ];
  const totalWasteBankBalance = 0;
  const participationData: { month: string; participants: number }[] = [];

  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Iuran Terkumpul</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {totalFees.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">November 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Warga Terdaftar</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">0 KK</div>
            <p className="text-xs text-gray-600 mt-1">Total kepala keluarga</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Saldo Bank Sampah</CardTitle>
            <Leaf className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">Rp {totalWasteBankBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs text-gray-600 mt-1">Semua warga</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Partisipasi Bank Sampah</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">0%</div>
            <p className="text-xs text-gray-600 mt-1">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran Warga</CardTitle>
            <CardDescription>Persentase pembayaran iuran bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentStatusData[0].count === 0 && paymentStatusData[1].count === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada data pembayaran</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
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
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Lunas</p>
                    <p className="text-xl">{paymentStatusData[0].count} warga</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Belum Bayar</p>
                    <p className="text-xl">{paymentStatusData[1].count} warga</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Participation Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Partisipasi Bank Sampah</CardTitle>
            <CardDescription>Jumlah warga aktif menyetor sampah per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            {participationData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Leaf className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada data partisipasi</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="participants" fill="#22c55e" name="Warga Aktif" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Rata-rata partisipasi</p>
                  <p className="text-xl">0 warga/bulan</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrendingUp, Users, Coins, Leaf, DollarSign, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Badge } from '../ui/badge';

interface ReportData {
  fees: {
    total: number;
    paid: number;
    pending: number;
    totalAmount: number;
    paidAmount: number;
  };
  wasteBank: {
    totalDeposits: number;
    totalWeight: number;
    totalValue: number;
    byType: { type: string; weight: number; value: number }[];
  };
  participation: {
    totalResidents: number;
    feePayersCount: number;
    wasteBankParticipantsCount: number;
  };
  financial: {
    totalIncome: number;
    feeIncome: number;
    wasteBankIncome: number;
  };
  yearlyData: {
    month: string;
    fees: number;
    wasteBank: number;
  }[];
}

export function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { session } = useAuth();

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = ['2025', '2024', '2023', '2022'];

  useEffect(() => {
    if (session?.access_token) {
      fetchReportData();
    }
  }, [selectedMonth, selectedYear, session]);

  const fetchReportData = async () => {
    if (!session?.access_token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/reports?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        console.error('Error fetching report data:', await response.text());
        toast.error('Gagal mengambil data laporan');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan RT - {monthLabel} {selectedYear}</CardTitle>
          <CardDescription>Pilih bulan dan tahun untuk melihat laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm mb-2 block">Bulan</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm mb-2 block">Tahun</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Memuat data laporan...</p>
        </div>
      ) : reportData ? (
        <>
          {/* Laporan Iuran */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Coins className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Laporan Iuran</CardTitle>
                  <CardDescription>Rekap pembayaran iuran bulan {monthLabel} {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Iuran</p>
                  <p className="text-2xl">{reportData.fees.total}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sudah Bayar</p>
                  <p className="text-2xl text-green-600">{reportData.fees.paid}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Belum Bayar</p>
                  <p className="text-2xl text-amber-600">{reportData.fees.pending}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Terkumpul</p>
                  <p className="text-xl text-purple-600">{formatCurrency(reportData.fees.paidAmount)}</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sudah Bayar', value: reportData.fees.paid },
                        { name: 'Belum Bayar', value: reportData.fees.pending },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Laporan Bank Sampah */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Laporan Bank Sampah</CardTitle>
                  <CardDescription>Rekap setoran sampah bulan {monthLabel} {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Setoran</p>
                  <p className="text-2xl">{reportData.wasteBank.totalDeposits}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Berat</p>
                  <p className="text-2xl text-blue-600">{reportData.wasteBank.totalWeight.toFixed(1)} kg</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Nilai</p>
                  <p className="text-xl text-purple-600">{formatCurrency(reportData.wasteBank.totalValue)}</p>
                </div>
              </div>

              {reportData.wasteBank.byType.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h4 className="mb-3">Berdasarkan Jenis Sampah</h4>
                    <div className="space-y-2">
                      {reportData.wasteBank.byType.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span>{item.type}</span>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <span className="text-gray-600">{item.weight.toFixed(1)} kg</span>
                            <span className="text-green-600">{formatCurrency(item.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.wasteBank.byType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `${value} kg`} />
                        <Bar dataKey="weight" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">Belum ada data setoran sampah bulan ini</p>
              )}
            </CardContent>
          </Card>

          {/* Laporan Keuangan */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Laporan Keuangan</CardTitle>
                  <CardDescription>Ringkasan keuangan RT bulan {monthLabel} {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Pemasukan</p>
                  <p className="text-2xl text-purple-600">{formatCurrency(reportData.financial.totalIncome)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dari Iuran</p>
                  <p className="text-xl text-blue-600">{formatCurrency(reportData.financial.feeIncome)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dari Bank Sampah</p>
                  <p className="text-xl text-green-600">{formatCurrency(reportData.financial.wasteBankIncome)}</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Iuran', value: reportData.financial.feeIncome },
                        { name: 'Bank Sampah', value: reportData.financial.wasteBankIncome },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Laporan Partisipasi */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Laporan Partisipasi</CardTitle>
                  <CardDescription>Tingkat partisipasi warga bulan {monthLabel} {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Warga</p>
                  <p className="text-2xl">{reportData.participation.totalResidents}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bayar Iuran</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl text-blue-600">{reportData.participation.feePayersCount}</p>
                    <Badge variant="outline">
                      {((reportData.participation.feePayersCount / reportData.participation.totalResidents) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Setor Sampah</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl text-green-600">{reportData.participation.wasteBankParticipantsCount}</p>
                    <Badge variant="outline">
                      {((reportData.participation.wasteBankParticipantsCount / reportData.participation.totalResidents) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        category: 'Partisipasi',
                        'Bayar Iuran': reportData.participation.feePayersCount,
                        'Setor Sampah': reportData.participation.wasteBankParticipantsCount,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Bayar Iuran" fill="#3b82f6" />
                    <Bar dataKey="Setor Sampah" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Laporan Tahunan */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle>Tren Tahunan</CardTitle>
                  <CardDescription>Grafik perkembangan iuran dan bank sampah tahun {selectedYear}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="fees" stroke="#3b82f6" name="Iuran" strokeWidth={2} />
                    <Line type="monotone" dataKey="wasteBank" stroke="#10b981" name="Bank Sampah" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data laporan</p>
        </div>
      )}
    </div>
  );
}

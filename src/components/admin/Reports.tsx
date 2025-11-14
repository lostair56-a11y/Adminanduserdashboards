import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

export function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2024');

  const generateReport = (type: string) => {
    alert(`Mengunduh laporan ${type} untuk ${selectedMonth}/${selectedYear}...`);
  };

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

  const years = ['2024', '2023', '2022'];

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Periode Laporan</CardTitle>
          <CardDescription>Tentukan bulan dan tahun untuk laporan</CardDescription>
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

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan Iuran</CardTitle>
                <CardDescription>Rekap pembayaran iuran</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Mencakup daftar warga, status pembayaran, dan total iuran terkumpul
            </p>
            <Button className="w-full" onClick={() => generateReport('Iuran')}>
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan Bank Sampah</CardTitle>
                <CardDescription>Rekap setoran sampah</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Mencakup total setoran, jenis sampah, berat, dan nilai ekonomi
            </p>
            <Button className="w-full" onClick={() => generateReport('Bank Sampah')}>
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan Keuangan</CardTitle>
                <CardDescription>Rekap keuangan lengkap</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Mencakup iuran, bank sampah, dan ringkasan keuangan RT
            </p>
            <Button className="w-full" onClick={() => generateReport('Keuangan')}>
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan Partisipasi</CardTitle>
                <CardDescription>Tingkat partisipasi warga</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Mencakup statistik partisipasi warga dalam program RT
            </p>
            <Button className="w-full" onClick={() => generateReport('Partisipasi')}>
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base">Laporan Tahunan</CardTitle>
                <CardDescription>Rekap seluruh tahun</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Laporan komprehensif untuk seluruh tahun {selectedYear}
            </p>
            <Button className="w-full" onClick={() => generateReport('Tahunan')}>
              <Download className="h-4 w-4 mr-2" />
              Unduh Laporan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

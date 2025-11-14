import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, LogOut, CreditCard, Leaf, Calendar, ArrowRight, QrCode, Wallet, Menu, X, User, Home, History, FileText } from 'lucide-react';
import { FeePaymentDialog } from './resident/FeePaymentDialog';
import { WasteBankPaymentDialog } from './resident/WasteBankPaymentDialog';
import { PaymentHistoryDialog } from './resident/PaymentHistoryDialog';
import { WasteBankHistoryDialog } from './resident/WasteBankHistoryDialog';
import { NotificationsDialog } from './resident/NotificationsDialog';
import { ResidentProfile } from './resident/ResidentProfile';

type MenuItem = 'dashboard' | 'payment-history' | 'wastebank-history' | 'profile';

interface ResidentDashboardProps {
  onLogout: () => void;
}

export function ResidentDashboard({ onLogout }: ResidentDashboardProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [showWasteBankPayment, setShowWasteBankPayment] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showWasteBankHistory, setShowWasteBankHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Data will be fetched from backend - using minimal default values
  const residentData = {
    name: 'Warga',
    address: 'Alamat belum diatur',
    feeStatus: 'unpaid' as 'paid' | 'unpaid',
    feeAmount: 0,
    wasteBankBalance: 0,
    notifications: 0,
    nextCollection: 'Belum ada jadwal',
  };

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Beranda', icon: Home },
    { id: 'payment-history' as MenuItem, label: 'Riwayat Iuran', icon: History },
    { id: 'wastebank-history' as MenuItem, label: 'Riwayat Bank Sampah', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Fee Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Iuran Bulanan</CardTitle>
                      <CardDescription>November 2024</CardDescription>
                    </div>
                  </div>
                  <Badge variant={residentData.feeStatus === 'paid' ? 'default' : 'destructive'}>
                    {residentData.feeStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jumlah Tagihan</p>
                  <p className="text-2xl">Rp {residentData.feeAmount.toLocaleString('id-ID')}</p>
                </div>

                {residentData.feeStatus === 'unpaid' && (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => setShowFeePayment(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Bayar via Bank BRI
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowWasteBankPayment(true)}
                      disabled={residentData.wasteBankBalance < residentData.feeAmount}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Gunakan Saldo Bank Sampah
                    </Button>
                    {residentData.wasteBankBalance < residentData.feeAmount && (
                      <p className="text-xs text-amber-600">
                        Saldo bank sampah tidak mencukupi
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setActiveMenu('payment-history')}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Lihat Riwayat Pembayaran</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>

            {/* Waste Bank Module */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Bank Sampah Digital</CardTitle>
                    <CardDescription>Saldo Anda saat ini</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                  <p className="text-sm opacity-90 mb-1">Total Saldo</p>
                  <p className="text-3xl">
                    Rp {residentData.wasteBankBalance.toLocaleString('id-ID')}
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu('wastebank-history')}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Riwayat Transaksi Bank Sampah</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>

            {/* Schedule & Information Module */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Informasi & Jadwal</CardTitle>
                    <CardDescription>Jadwal pengangkutan sampah</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Calendar className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Jadwal Pengangkutan Berikutnya</p>
                      <p className="text-xl text-gray-900">{residentData.nextCollection}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Harap siapkan sampah Anda sebelum pukul 07:00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'payment-history':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pembayaran Iuran</CardTitle>
              <CardDescription>Histori pembayaran iuran bulanan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada riwayat pembayaran</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'wastebank-history':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi Bank Sampah</CardTitle>
              <CardDescription>Detail setoran dan penggunaan saldo bank sampah</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada transaksi bank sampah</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'profile':
        return <ResidentProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2>Dashboard</h2>
                <p className="text-sm text-gray-600">RT 003/RW 005</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveMenu('profile');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm">{residentData.name}</p>
                <p className="text-xs text-gray-600">{residentData.address}</p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${activeMenu === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1>
                    {activeMenu === 'dashboard' && 'Beranda'}
                    {activeMenu === 'payment-history' && 'Riwayat Iuran'}
                    {activeMenu === 'wastebank-history' && 'Riwayat Bank Sampah'}
                    {activeMenu === 'profile' && 'Profil Saya'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {residentData.notifications > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {residentData.notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
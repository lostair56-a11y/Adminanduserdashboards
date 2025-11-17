import { ResidentProfile } from './resident/ResidentProfile';
import { useAuth } from '../contexts/AuthContext';
import type { ResidentProfile as ResidentProfileType } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Home, 
  User, 
  CreditCard, 
  Calendar, 
  Leaf, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  History, 
  FileText, 
  ArrowRight, 
  Wallet,
  AlertCircle 
} from 'lucide-react';
import { FeePaymentDialog } from './resident/FeePaymentDialog';
import { WasteBankPaymentDialog } from './resident/WasteBankPaymentDialog';
import { PaymentHistoryDialog } from './resident/PaymentHistoryDialog';
import { WasteBankHistoryDialog } from './resident/WasteBankHistoryDialog';
import { NotificationsDialog } from './resident/NotificationsDialog';

type MenuItem = 'dashboard' | 'payment-history' | 'wastebank-history' | 'profile';

interface FeeRecord {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'unpaid' | 'pending';
  payment_date?: string;
  payment_method?: string;
  description?: string;
}

export function ResidentDashboard() {
  const { signOut, profile, user } = useAuth();
  const residentProfile = profile as ResidentProfileType;
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [showWasteBankPayment, setShowWasteBankPayment] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showWasteBankHistory, setShowWasteBankHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeeId, setSelectedFeeId] = useState<string | undefined>();
  const [selectedFeeAmount, setSelectedFeeAmount] = useState<number>(0);

  useEffect(() => {
    if (user?.id) {
      fetchFees();
    }
  }, [user]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFees(data.fees || []);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get unpaid fees
  const unpaidFees = fees.filter(fee => fee.status === 'unpaid');
  const paidFees = fees.filter(fee => fee.status === 'paid');

  // Data from profile
  const residentData = {
    name: residentProfile?.name || 'Warga',
    address: residentProfile?.address || 'Alamat belum diatur',
    feeStatus: 'unpaid' as 'paid' | 'unpaid',
    feeAmount: 50000,
    wasteBankBalance: residentProfile?.waste_bank_balance || 0,
    notifications: unpaidFees.length,
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
          <div className="space-y-6">
            {/* Unpaid Bills Section */}
            {loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat tagihan...</p>
                  </div>
                </CardContent>
              </Card>
            ) : unpaidFees.length > 0 ? (
              <Card className="border-l-4 border-l-red-500 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle>Tagihan Belum Dibayar</CardTitle>
                      <CardDescription>Anda memiliki {unpaidFees.length} tagihan yang belum dibayar</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {unpaidFees.map((fee) => (
                    <div key={fee.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm text-gray-600">Periode</p>
                          <p className="font-medium">{fee.month} {fee.year}</p>
                        </div>
                        <Badge variant="destructive">Belum Bayar</Badge>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Jumlah Tagihan</p>
                        <p className="text-xl text-red-600">Rp {fee.amount.toLocaleString('id-ID')}</p>
                      </div>
                      {fee.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Keterangan</p>
                          <p className="text-sm">{fee.description}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                          onClick={() => {
                            setShowFeePayment(true);
                            setSelectedFeeId(fee.id);
                            setSelectedFeeAmount(fee.amount);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Bayar via Bank BRI
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setShowWasteBankPayment(true);
                            setSelectedFeeId(fee.id);
                            setSelectedFeeAmount(fee.amount);
                          }}
                          disabled={residentData.wasteBankBalance < fee.amount}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Gunakan Saldo Bank Sampah
                        </Button>
                        {residentData.wasteBankBalance < fee.amount && (
                          <p className="text-xs text-amber-600">
                            Saldo bank sampah tidak mencukupi
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Status Pembayaran</CardTitle>
                      <CardDescription>Semua tagihan sudah lunas</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-green-600">✓ Tidak ada tagihan yang belum dibayar</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Waste Bank Module */}
              <Card className="shadow-lg border-t-4 border-t-green-500">
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
                  <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-xl">
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
              <Card className="shadow-lg border-t-4 border-t-amber-500">
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

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Tagihan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{fees.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Semua periode</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Sudah Dibayar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{paidFees.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Tagihan lunas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Belum Dibayar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-600">{unpaidFees.length}</div>
                  <p className="text-xs text-gray-600 mt-1">Perlu dibayar</p>
                </CardContent>
              </Card>
            </div>
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
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat data...</p>
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada riwayat pembayaran</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fees.map((fee) => (
                    <div key={fee.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{fee.month} {fee.year}</p>
                          {fee.description && (
                            <p className="text-sm text-gray-600">{fee.description}</p>
                          )}
                        </div>
                        <Badge 
                          variant={
                            fee.status === 'paid' ? 'default' : 
                            fee.status === 'pending' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {fee.status === 'paid' ? 'Lunas' : 
                           fee.status === 'pending' ? 'Menunggu Verifikasi' : 
                           'Belum Bayar'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Jumlah</p>
                          <p>Rp {fee.amount.toLocaleString('id-ID')}</p>
                        </div>
                        {fee.payment_date && (
                          <div>
                            <p className="text-gray-600">Tanggal Bayar</p>
                            <p>{new Date(fee.payment_date).toLocaleDateString('id-ID')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 to-green-800 border-r border-green-700 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white">Dashboard</h2>
                <p className="text-sm text-green-200">RT 003/RW 005</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-green-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-4 border-b border-green-700">
            <button
              onClick={() => {
                setActiveMenu('profile');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-700/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-white">{residentData.name}</p>
                <p className="text-xs text-green-200">{residentData.address}</p>
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${activeMenu === item.id
                      ? 'bg-white text-green-600 shadow-lg'
                      : 'text-white hover:bg-green-700/50'
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
          <div className="p-4 border-t border-green-700">
            <Button
              variant="outline"
              className="w-full bg-transparent border-white text-white hover:bg-white hover:text-green-600 transition-all"
              onClick={handleLogout}
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
                  <h1 className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
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

      {/* Payment Dialogs */}
      <FeePaymentDialog
        open={showFeePayment}
        onOpenChange={setShowFeePayment}
        amount={selectedFeeAmount}
        feeId={selectedFeeId}
        onPaymentSuccess={fetchFees}
      />
      <WasteBankPaymentDialog
        open={showWasteBankPayment}
        onOpenChange={setShowWasteBankPayment}
        feeId={selectedFeeId}
        amount={selectedFeeAmount}
        balance={residentData.wasteBankBalance}
        onSuccess={fetchFees}
      />
      <PaymentHistoryDialog
        open={showPaymentHistory}
        onOpenChange={setShowPaymentHistory}
      />
      <WasteBankHistoryDialog
        open={showWasteBankHistory}
        onOpenChange={setShowWasteBankHistory}
      />
      <NotificationsDialog
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </div>
  );
}
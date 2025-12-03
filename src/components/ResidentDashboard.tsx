import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Calendar,
  CreditCard,
  Menu,
  X,
  User,
  LogOut,
  AlertCircle,
  Leaf,
  Bell,
  Wallet,
  ArrowRight,
  History,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AnimatedCard } from './animations/AnimatedCard';
import { FloatingElement } from './animations/FloatingElement';
import { StaggerContainer, StaggerItem } from './animations/StaggerContainer';
import { GlowingBadge } from './animations/GlowingBadge';
import { FeePaymentDialog } from './resident/FeePaymentDialog';
import { WasteBankPaymentDialog } from './resident/WasteBankPaymentDialog';
import { PaymentHistoryDialog } from './resident/PaymentHistoryDialog';
import { WasteBankHistoryDialog } from './resident/WasteBankHistoryDialog';
import { NotificationsDialog } from './resident/NotificationsDialog';
import { ResidentProfile as ResidentProfileComp } from './resident/ResidentProfile';
import { useAuth } from '../contexts/AuthContext';
import { ResidentProfile } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { projectId } from '../utils/supabase/info';
import { getPublicSchedules } from '../lib/db-helpers';

type MenuItem = 'dashboard' | 'payment-history' | 'wastebank-history' | 'schedules' | 'profile';

interface FeeRecord {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'unpaid' | 'pending';
  description?: string;
  payment_date?: string | null;
  payment_proof?: string | null;
  payment_method?: string | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: string;
  notes?: string;
}

interface WasteTransaction {
  id: string;
  waste_type: string;
  weight: number;
  total_value: number;
  date: string;
}

export function ResidentDashboard() {
  const { signOut, profile, user } = useAuth();
  const residentProfile = profile as ResidentProfile;
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [showWasteBankPayment, setShowWasteBankPayment] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showWasteBankHistory, setShowWasteBankHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [wasteTransactions, setWasteTransactions] = useState<WasteTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);
  const [wasteLoading, setWasteLoading] = useState(true);
  const [selectedFeeId, setSelectedFeeId] = useState<string | undefined>();
  const [selectedFeeAmount, setSelectedFeeAmount] = useState<number>(0);

  useEffect(() => {
    if (user?.id) {
      fetchFees();
      fetchSchedules();
      fetchWasteTransactions();
    }
  }, [user]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('❌ No session or access token found');
        return;
      }

      console.log('📋 Fetching fees for user:', user?.id);
      console.log('🔑 Access token present:', !!session.access_token);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Fees response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fees data received:', data);
        console.log('📊 Number of fees:', data.fees?.length || 0);
        if (data.fees && data.fees.length > 0) {
          console.log('📝 First fee:', data.fees[0]);
          console.log('📝 First fee fields:', Object.keys(data.fees[0]));
          console.log('📝 All fees:', JSON.stringify(data.fees, null, 2));
        }
        
        // IMPORTANT: Set fees to state
        const feesArray = data.fees || [];
        console.log('💾 Setting fees to state, count:', feesArray.length);
        setFees(feesArray);
        
        // Debug: log filtered fees AFTER setting state
        setTimeout(() => {
          const unpaid = feesArray.filter((f: any) => f.status === 'unpaid');
          const paid = feesArray.filter((f: any) => f.status === 'paid');
          console.log('🔴 Unpaid fees count:', unpaid.length);
          console.log('✅ Paid fees count:', paid.length);
          if (unpaid.length > 0) {
            console.log('🔴 First unpaid fee:', unpaid[0]);
          }
          console.log('📦 Current fees state should be:', feesArray.length);
        }, 100);
      } else {
        const errorData = await response.json();
        console.error('❌ Error response from server:', errorData);
        toast.error('Gagal memuat tagihan: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error fetching fees:', error);
      toast.error('Gagal memuat tagihan');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setSchedulesLoading(true);
    try {
      console.log('Fetching schedules for resident using direct query');
      
      const schedules = await getPublicSchedules();
      console.log('Schedules data received:', schedules);
      console.log('Number of schedules:', schedules.length);
      setSchedules(schedules);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal memuat jadwal: ' + error.message);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchWasteTransactions = async () => {
    setWasteLoading(true);
    try {
      console.log('Fetching waste transactions for resident using direct query');
      
      const { data, error } = await supabase
        .from('waste_deposits')
        .select('*')
        .eq('resident_id', user?.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching waste transactions:', error);
      } else {
        console.log('Waste transactions data received:', data);
        console.log('Number of transactions:', data?.length || 0);
        setWasteTransactions(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching waste transactions:', error);
    } finally {
      setWasteLoading(false);
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

  // Get next scheduled pickup
  const nextSchedule = schedules.length > 0 ? schedules[0] : null;

  // Data from profile
  const residentData = {
    name: residentProfile?.name || 'Warga',
    address: residentProfile?.address || 'Alamat belum diatur',
    feeStatus: 'unpaid' as 'paid' | 'unpaid',
    feeAmount: 50000,
    wasteBankBalance: residentProfile?.waste_bank_balance || 0,
    notifications: unpaidFees.length,
    nextCollection: nextSchedule 
      ? `${new Date(nextSchedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })} - ${nextSchedule.time}`
      : 'Belum ada jadwal',
    nextScheduleArea: nextSchedule?.area || '',
  };

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Beranda', icon: Home },
    { id: 'payment-history' as MenuItem, label: 'Riwayat Iuran', icon: History },
    { id: 'wastebank-history' as MenuItem, label: 'Riwayat Bank Sampah', icon: FileText },
    { id: 'schedules' as MenuItem, label: 'Jadwal Pengangkutan', icon: Calendar },
    { id: 'profile' as MenuItem, label: 'Profil', icon: User },
  ];

  const renderContent = () => {
    // Debug rendering
    console.log('🎨 RENDERING - activeMenu:', activeMenu);
    console.log('🎨 RENDERING - loading:', loading);
    console.log('🎨 RENDERING - fees.length:', fees.length);
    console.log('🎨 RENDERING - unpaidFees.length:', unpaidFees.length);
    console.log('🎨 RENDERING - paidFees.length:', paidFees.length);
    console.log('🎨 RENDERING - fees:', fees);
    console.log('🎨 RENDERING - unpaidFees:', unpaidFees);
    
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6 relative">
            {/* Floating Sparkles Background */}
            <motion.div
              className="absolute top-10 left-10 text-yellow-400 opacity-30 pointer-events-none"
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5L12 0z" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute top-32 right-20 text-green-400 opacity-20 pointer-events-none"
              animate={{
                y: [20, -20, 20],
                rotate: [360, 0],
                scale: [1, 0.5, 1],
              }}
              transition={{ duration: 7, repeat: Infinity }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5L12 0z" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute bottom-20 left-1/2 text-blue-400 opacity-25 pointer-events-none"
              animate={{
                y: [-10, 10, -10],
                x: [-10, 10, -10],
                rotate: [0, 180, 360],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0l1.5 8.5L22 10l-8.5 1.5L12 20l-1.5-8.5L2 10l8.5-1.5L12 0z" />
              </svg>
            </motion.div>

            {/* Unpaid Bills Section */}
            {loading ? (
              <Card className="relative z-10">
                <CardContent className="py-12">
                  <div className="text-center">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-600">Memuat tagihan...</p>
                  </div>
                </CardContent>
              </Card>
            ) : unpaidFees.length > 0 ? (
              <AnimatedCard variant="bounce" className="border-l-4 border-l-red-500 shadow-2xl relative z-10">
                <Card className="border-0">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FloatingElement duration={2}>
                        <motion.div 
                          className="p-2 bg-red-100 rounded-lg"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </motion.div>
                      </FloatingElement>
                      <div>
                        <CardTitle>Tagihan Belum Dibayar</CardTitle>
                        <CardDescription>
                          Anda memiliki <GlowingBadge variant="destructive" glowColor="rgba(220, 38, 38, 0.5)">{unpaidFees.length}</GlowingBadge> tagihan yang belum dibayar
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <StaggerContainer className="space-y-3">
                      {unpaidFees.map((fee, index) => (
                        <StaggerItem key={fee.id}>
                          <motion.div 
                            className="p-4 bg-red-50 border border-red-200 rounded-lg"
                            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2)' }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm text-gray-600">Periode</p>
                                <p className="font-medium">{fee.month} {fee.year}</p>
                              </div>
                              <GlowingBadge variant="destructive" glowColor="rgba(220, 38, 38, 0.5)">
                                Belum Bayar
                              </GlowingBadge>
                            </div>
                            <div className="mb-2">
                              <p className="text-sm text-gray-600">Jumlah Tagihan</p>
                              <motion.p 
                                className="text-xl text-red-600"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                Rp {fee.amount.toLocaleString('id-ID')}
                              </motion.p>
                            </div>
                            {fee.description && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">Keterangan</p>
                                <p className="text-sm">{fee.description}</p>
                              </div>
                            )}
                            <div className="space-y-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg"
                                  onClick={() => {
                                    setShowFeePayment(true);
                                    setSelectedFeeId(fee.id);
                                    setSelectedFeeAmount(fee.amount);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Bayar via Bank BRI
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                              </motion.div>
                              {residentData.wasteBankBalance < fee.amount && (
                                <motion.p 
                                  className="text-xs text-amber-600"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  Saldo bank sampah tidak mencukupi
                                </motion.p>
                              )}
                            </div>
                          </motion.div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ) : (
              <AnimatedCard variant="scale" className="border-l-4 border-l-green-500 shadow-xl relative z-10">
                <Card className="border-0">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FloatingElement duration={2.5}>
                        <motion.div 
                          className="p-2 bg-green-100 rounded-lg"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <CreditCard className="h-6 w-6 text-green-600" />
                        </motion.div>
                      </FloatingElement>
                      <div>
                        <CardTitle>Status Pembayaran</CardTitle>
                        <CardDescription>Semua tagihan sudah lunas</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="text-center py-6"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.p 
                        className="text-green-600 text-xl"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✓ Tidak ada tagihan yang belum dibayar
                      </motion.p>
                    </motion.div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            )}

            <div className="grid gap-6 lg:grid-cols-2 relative z-10">
              {/* Waste Bank Module */}
              <AnimatedCard variant="slide" delay={0.2} className="shadow-2xl border-t-4 border-t-green-500">
                <Card className="border-0 overflow-hidden relative">
                  {/* Floating sparkles */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-green-400 opacity-50" />
                  </motion.div>
                  
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FloatingElement duration={2.5}>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Leaf className="h-6 w-6 text-green-600" />
                        </div>
                      </FloatingElement>
                      <div>
                        <CardTitle>Bank Sampah Digital</CardTitle>
                        <CardDescription>Saldo Anda saat ini</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div 
                      className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-xl relative overflow-hidden"
                      whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(34, 197, 94, 0.4)' }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {/* Animated background effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <p className="text-sm opacity-90 mb-1 relative z-10">Total Saldo</p>
                      <motion.p 
                        className="text-3xl relative z-10"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Rp {residentData.wasteBankBalance.toLocaleString('id-ID')}
                      </motion.p>
                    </motion.div>

                    <motion.button
                      onClick={() => setActiveMenu('wastebank-history')}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm">Riwayat Transaksi Bank Sampah</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* Schedule & Information Module */}
              <AnimatedCard variant="slide" delay={0.3} className="shadow-2xl border-t-4 border-t-amber-500">
                <Card className="border-0">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FloatingElement duration={3} delay={0.5}>
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-amber-600" />
                        </div>
                      </FloatingElement>
                      <div>
                        <CardTitle>Informasi & Jadwal</CardTitle>
                        <CardDescription>Jadwal pengangkutan sampah</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {schedulesLoading ? (
                      <div className="text-center py-6">
                        <motion.div 
                          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-gray-600">Memuat jadwal...</p>
                      </div>
                    ) : nextSchedule ? (
                      <motion.div 
                        className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)'
                        }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="flex items-center gap-4">
                          <FloatingElement>
                            <motion.div 
                              className="p-3 bg-white rounded-lg shadow-sm"
                              animate={{ rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            >
                              <Calendar className="h-8 w-8 text-amber-600" />
                            </motion.div>
                          </FloatingElement>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Jadwal Pengangkutan Berikutnya</p>
                            <motion.p 
                              className="text-xl text-gray-900"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {residentData.nextCollection}
                            </motion.p>
                            <motion.p 
                              className="text-sm text-gray-600 mt-1"
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              Harap siapkan sampah Anda sebelum pukul 07:00 WIB
                            </motion.p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="text-center py-6 text-gray-500"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Belum ada jadwal pengangkutan</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Quick Stats */}
            <StaggerContainer className="grid gap-6 md:grid-cols-3 relative z-10">
              <StaggerItem>
                <AnimatedCard variant="scale" delay={0.4}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Tagihan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        className="text-2xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {fees.length}
                      </motion.div>
                      <p className="text-xs text-gray-600 mt-1">Semua periode</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
              <StaggerItem>
                <AnimatedCard variant="scale" delay={0.5}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Sudah Dibayar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        className="text-2xl text-green-600"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          textShadow: [
                            '0 0 5px rgba(34, 197, 94, 0)',
                            '0 0 10px rgba(34, 197, 94, 0.5)',
                            '0 0 5px rgba(34, 197, 94, 0)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {paidFees.length}
                      </motion.div>
                      <p className="text-xs text-gray-600 mt-1">Tagihan lunas</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
              <StaggerItem>
                <AnimatedCard variant="scale" delay={0.6}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Belum Dibayar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        className="text-2xl text-red-600"
                        animate={{ 
                          scale: unpaidFees.length > 0 ? [1, 1.15, 1] : 1,
                          textShadow: unpaidFees.length > 0 ? [
                            '0 0 5px rgba(220, 38, 38, 0)',
                            '0 0 15px rgba(220, 38, 38, 0.6)',
                            '0 0 5px rgba(220, 38, 38, 0)'
                          ] : undefined
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {unpaidFees.length}
                      </motion.div>
                      <p className="text-xs text-gray-600 mt-1">Perlu dibayar</p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            </StaggerContainer>
          </div>
        );
      case 'payment-history':
        return (
          <AnimatedCard variant="scale" className="shadow-xl">
            <Card className="border-0">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <FloatingElement duration={2}>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <History className="h-6 w-6 text-blue-600" />
                    </div>
                  </FloatingElement>
                  <div>
                    <CardTitle>Riwayat Pembayaran Iuran</CardTitle>
                    <CardDescription>Histori pembayaran iuran bulanan Anda</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-600">Memuat data...</p>
                  </div>
                ) : fees.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada riwayat pembayaran</p>
                  </motion.div>
                ) : (
                  <StaggerContainer className="space-y-3">
                    {fees.map((fee, index) => (
                      <StaggerItem key={fee.id}>
                        <motion.div 
                          className="p-4 border rounded-lg"
                          whileHover={{ 
                            scale: 1.02, 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            borderColor: fee.status === 'paid' ? 'rgb(34, 197, 94)' : fee.status === 'pending' ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{fee.month} {fee.year}</p>
                              {fee.description && (
                                <p className="text-sm text-gray-600">{fee.description}</p>
                              )}
                            </div>
                            <GlowingBadge 
                              variant={
                                fee.status === 'paid' ? 'default' : 
                                fee.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                              glowColor={
                                fee.status === 'paid' ? 'rgba(34, 197, 94, 0.5)' : 
                                fee.status === 'pending' ? 'rgba(234, 179, 8, 0.5)' : 
                                'rgba(239, 68, 68, 0.5)'
                              }
                            >
                              {fee.status === 'paid' ? 'Lunas' : 
                               fee.status === 'pending' ? 'Menunggu Verifikasi' : 
                               'Belum Bayar'}
                            </GlowingBadge>
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
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        );
      case 'schedules':
        return (
          <AnimatedCard variant="scale" className="shadow-xl">
            <Card className="border-0">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <FloatingElement duration={2.5}>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                  </FloatingElement>
                  <div>
                    <CardTitle>Jadwal Pengangkutan Sampah</CardTitle>
                    <CardDescription>Jadwal pengangkutan sampah untuk RT {residentProfile?.rt} / RW {residentProfile?.rw}</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                {schedulesLoading ? (
                  <div className="text-center py-12">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-600">Memuat jadwal...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada jadwal pengangkutan</p>
                    <p className="text-sm mt-1">Admin RT belum menambahkan jadwal</p>
                  </motion.div>
                ) : (
                  <StaggerContainer className="space-y-4">
                    {schedules.map((schedule, index) => (
                      <StaggerItem key={schedule.id}>
                        <motion.div
                          className="p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg overflow-hidden relative"
                          whileHover={{ 
                            scale: 1.02, 
                            boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)',
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-transparent"
                            animate={{ x: [-100, 400] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          />
                          <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-4">
                              <FloatingElement duration={2 + index * 0.5}>
                                <motion.div 
                                  className="text-center min-w-[4rem] p-3 bg-white rounded-lg shadow-sm"
                                  whileHover={{ rotate: [0, -5, 5, 0] }}
                                >
                                  <p className="text-2xl text-amber-600">
                                    {new Date(schedule.date).getDate()}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(schedule.date).toLocaleDateString('id-ID', { month: 'short' })}
                                  </p>
                                </motion.div>
                              </FloatingElement>
                              <div>
                                <p className="font-medium text-lg">
                                  {new Date(schedule.date).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{schedule.time}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Area: {schedule.area}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <GlowingBadge 
                              variant="outline" 
                              className="bg-white"
                              glowColor="rgba(251, 146, 60, 0.3)"
                            >
                              {schedule.status === 'scheduled' ? 'Terjadwal' : 'Selesai'}
                            </GlowingBadge>
                          </div>
                          <div className="mt-3 pt-3 border-t border-amber-200 relative z-10">
                            <motion.p 
                              className="text-sm text-gray-600 flex items-center gap-2"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <AlertCircle className="h-4 w-4" />
                              Harap siapkan sampah Anda sebelum waktu pengangkutan
                            </motion.p>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        );
      case 'wastebank-history':
        return (
          <AnimatedCard variant="scale" className="shadow-xl">
            <Card className="border-0">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <FloatingElement duration={2}>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Leaf className="h-6 w-6 text-green-600" />
                    </div>
                  </FloatingElement>
                  <div>
                    <CardTitle>Riwayat Transaksi Bank Sampah</CardTitle>
                    <CardDescription>Detail setoran dan penggunaan saldo bank sampah</CardDescription>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent>
                {wasteLoading ? (
                  <div className="text-center py-12">
                    <motion.div 
                      className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-600">Memuat data...</p>
                  </div>
                ) : wasteTransactions.length === 0 ? (
                  <motion.div 
                    className="text-center py-12 text-gray-500"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada transaksi bank sampah</p>
                  </motion.div>
                ) : (
                  <StaggerContainer className="space-y-3">
                    {wasteTransactions.map((transaction) => (
                      <StaggerItem key={transaction.id}>
                        <motion.div 
                          className="p-4 border rounded-lg relative overflow-hidden"
                          whileHover={{ 
                            scale: 1.02, 
                            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.2)',
                            borderColor: 'rgb(34, 197, 94)'
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-transparent"
                            animate={{ x: [-100, 300] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          />
                          <div className="flex items-center justify-between mb-2 relative z-10">
                            <div>
                              <p className="font-medium">
                                {new Date(transaction.date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-gray-600">{transaction.waste_type}</p>
                            </div>
                            <GlowingBadge variant="default" glowColor="rgba(34, 197, 94, 0.5)">
                              Selesai
                            </GlowingBadge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                            <div>
                              <p className="text-gray-600">Berat</p>
                              <p>{transaction.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Nilai</p>
                              <motion.p 
                                className="text-green-600"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                Rp {transaction.total_value.toLocaleString('id-ID')}
                              </motion.p>
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        );
      case 'profile':
        return <ResidentProfileComp />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -300, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 to-green-800 border-r border-green-700 shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border-b border-green-700 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"
              animate={{
                x: [-100, 300],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <motion.h2
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  className="text-white flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  Dashboard
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-green-200"
                >
                  RT {residentProfile?.rt || '0'} / RW {residentProfile?.rw || '0'}
                </motion.p>
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
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="p-4 border-b border-green-700"
          >
            <FloatingElement>
              <motion.button
                onClick={() => {
                  setActiveMenu('profile');
                  setSidebarOpen(false);
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(22, 163, 74, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-700/50 transition-colors relative overflow-hidden"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 255, 255, 0.3)',
                      '0 0 30px rgba(255, 255, 255, 0.5)',
                      '0 0 20px rgba(255, 255, 255, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <User className="h-5 w-5 text-green-600" />
                </motion.div>
                <div className="text-left flex-1">
                  <p className="text-sm text-white">{residentData.name}</p>
                  <p className="text-xs text-green-200">{residentData.address}</p>
                </div>
              </motion.button>
            </FloatingElement>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, type: 'spring', stiffness: 100 }}
                >
                  <motion.button
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarOpen(false);
                    }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? {
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={isActive ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : {}}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative overflow-hidden
                      ${isActive
                        ? 'bg-white text-green-600 shadow-lg'
                        : 'text-white hover:bg-green-700/50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeMenuResident"
                        className="absolute inset-0 bg-white rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto relative z-10"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="p-4 border-t border-green-700"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="w-full bg-transparent border-white text-white hover:bg-white hover:text-green-600 transition-all"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="bg-white border-b border-gray-200 shadow-sm relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-100/20 via-transparent to-blue-100/20"
            animate={{
              x: [-500, 500],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </motion.div>
                <div>
                  <motion.h1
                    key={activeMenu}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    {activeMenu === 'dashboard' && 'Beranda'}
                    {activeMenu === 'payment-history' && 'Riwayat Iuran'}
                    {activeMenu === 'wastebank-history' && 'Riwayat Bank Sampah'}
                    {activeMenu === 'schedules' && 'Jadwal Pengangkutan'}
                    {activeMenu === 'profile' && 'Profil Saya'}
                  </motion.h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowNotifications(true)}
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {residentData.notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        scale: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
                      }}
                      className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {residentData.notifications}
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <PageTransition>
            {renderContent()}
          </PageTransition>
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
        onSuccess={() => {
          fetchFees();
          fetchWasteTransactions();
        }}
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
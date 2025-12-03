import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, DollarSign, Recycle, Calendar, FileText, LogOut, Menu, Bell, User, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StatsOverview } from './admin/StatsOverview';
import { ManageResidents } from './admin/ManageResidents';
import { ManageFees } from './admin/ManageFees';
import { ManageWasteBank } from './admin/ManageWasteBank';
import { ManageSchedule } from './admin/ManageSchedule';
import { Reports } from './admin/Reports';
import { AdminProfile } from './admin/AdminProfile';
import { PendingPaymentsDialog } from './admin/PendingPaymentsDialog';
import { supabase } from '../lib/supabase';
import { getPendingFees } from '../lib/db-helpers';
import { motion, AnimatePresence } from 'motion/react';
import { PageTransition } from './animations/PageTransition';
import { FloatingElement } from './animations/FloatingElement';
import { GlowingBadge } from './animations/GlowingBadge';

type MenuItem = 'dashboard' | 'residents' | 'fees' | 'wastebank' | 'schedule' | 'reports' | 'profile';

export function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const data = await getPendingFees();
      setPendingCount(data.length);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard' as MenuItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'residents' as MenuItem, label: 'Kelola Data Warga', icon: Users },
    { id: 'fees' as MenuItem, label: 'Kelola Iuran & Pembayaran', icon: DollarSign },
    { id: 'wastebank' as MenuItem, label: 'Kelola Bank Sampah', icon: Recycle },
    { id: 'schedule' as MenuItem, label: 'Kelola Jadwal Pengangkutan', icon: Calendar },
    { id: 'reports' as MenuItem, label: 'Laporan', icon: FileText },
    { id: 'profile' as MenuItem, label: 'Profil Admin', icon: User },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <StatsOverview />;
      case 'residents':
        return <ManageResidents />;
      case 'fees':
        return <ManageFees />;
      case 'wastebank':
        return <ManageWasteBank />;
      case 'schedule':
        return <ManageSchedule />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <AdminProfile />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
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
        className="absolute bottom-0 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"
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
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-700 shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border-b border-blue-700 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent"
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
                  Admin RT
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-blue-200"
                >
                  Panel Kontrol
                </motion.p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-blue-700"
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
            className="p-4 border-b border-blue-700"
          >
            <FloatingElement>
              <motion.button
                onClick={() => {
                  setActiveMenu('profile');
                  setSidebarOpen(false);
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(29, 78, 216, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700/50 transition-colors relative overflow-hidden"
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
                  <User className="h-5 w-5 text-blue-600" />
                </motion.div>
                <div className="text-left flex-1">
                  <p className="text-sm text-white">Admin RT</p>
                  <p className="text-xs text-blue-200">{profile?.position || 'Ketua RT 003'}</p>
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
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white hover:bg-blue-700/50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeMenu"
                        className="absolute inset-0 bg-white rounded-lg"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <motion.div
                      className="relative z-10"
                      animate={isActive ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={isActive ? { duration: 0.5, repeat: Infinity, repeatDelay: 3 } : {}}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
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
            transition={{ delay: 1.3 }}
            className="p-4 border-t border-blue-700"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                className="w-full bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-all"
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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-transparent to-green-100/50"
            animate={{
              x: [-1000, 1000],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="flex items-center justify-between relative z-10">
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
                  className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
                >
                  {activeMenu === 'profile' ? 'Profil Admin' : (menuItems.find((item) => item.id === activeMenu)?.label || 'Dashboard')}
                </motion.h1>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-end">
              {/* Notification Badge */}
              <FloatingElement>
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative"
                      onClick={() => setShowPendingPayments(true)}
                    >
                      <motion.div
                        animate={pendingCount > 0 ? { rotate: [0, 15, -15, 0] } : {}}
                        transition={pendingCount > 0 ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : {}}
                      >
                        <Bell className="h-5 w-5" />
                      </motion.div>
                      {pendingCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ 
                            scale: 1,
                            boxShadow: [
                              '0 0 5px rgba(239, 68, 68, 0.5)',
                              '0 0 20px rgba(239, 68, 68, 0.8)',
                              '0 0 5px rgba(239, 68, 68, 0.5)',
                            ]
                          }}
                          transition={{ 
                            scale: { type: 'spring', stiffness: 500 },
                            boxShadow: { duration: 2, repeat: Infinity }
                          }}
                          className="absolute -top-1 -right-1 rounded-full"
                        >
                          <Badge 
                            variant="destructive" 
                            className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {pendingCount}
                          </Badge>
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </FloatingElement>

              {/* Admin Profile Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex flex-col items-end"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-sm"
                >
                  {profile?.name || 'Admin'}
                </motion.span>
                <span className="text-xs text-gray-500">
                  RT {profile?.rt || '0'} / RW {profile?.rw || '0'} - {profile?.kelurahan || 'N/A'}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={signOut}
                  variant="destructive"
                  size="sm"
                  className="hidden md:flex gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </motion.div>

              <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Pending Payments Dialog */}
      <PendingPaymentsDialog
        open={showPendingPayments}
        onOpenChange={setShowPendingPayments}
        onVerificationComplete={fetchPendingCount}
      />
    </div>
  );
}
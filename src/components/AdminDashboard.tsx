import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LayoutDashboard, Users, DollarSign, Trash2, Calendar, FileText, LogOut, Menu, X, User, Database, ClipboardCheck } from 'lucide-react';
import { StatsOverview } from './admin/StatsOverview';
import { ManageResidents } from './admin/ManageResidents';
import { ManageFees } from './admin/ManageFees';
import { ManageWasteBank } from './admin/ManageWasteBank';
import { ManageSchedule } from './admin/ManageSchedule';
import { Reports } from './admin/Reports';
import { AdminProfile } from './admin/AdminProfile';
import { DatabaseMigration } from './admin/DatabaseMigration';
import { PendingPaymentsDialog } from './admin/PendingPaymentsDialog';
import { useAuth } from '../contexts/AuthContext';
import type { AdminProfile as AdminProfileType } from '../lib/supabase';

type MenuItem = 'dashboard' | 'residents' | 'fees' | 'wastebank' | 'schedule' | 'reports' | 'profile' | 'migration';

export function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const adminProfile = profile as AdminProfileType;
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);

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
    { id: 'wastebank' as MenuItem, label: 'Kelola Bank Sampah', icon: Trash2 },
    { id: 'schedule' as MenuItem, label: 'Kelola Jadwal Pengangkutan', icon: Calendar },
    { id: 'reports' as MenuItem, label: 'Laporan', icon: FileText },
    { id: 'migration' as MenuItem, label: 'Migrasi Database', icon: Database },
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
      case 'migration':
        return <DatabaseMigration />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-blue-800 border-r border-blue-700 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white">Admin RT</h2>
                <p className="text-sm text-blue-200">Panel Kontrol</p>
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
          </div>

          {/* Profile Section */}
          <div className="p-4 border-b border-blue-700">
            <button
              onClick={() => {
                setActiveMenu('profile');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-700/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-white">Admin RT</p>
                <p className="text-xs text-blue-200">{adminProfile?.position || 'Ketua RT 003'}</p>
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
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-blue-700/50'
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
          <div className="p-4 border-t border-blue-700">
            <Button
              variant="outline"
              className="w-full bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-all"
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
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
                <h1 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {menuItems.find((item) => item.id === activeMenu)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>
            <Button
              onClick={() => setShowPendingPayments(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Verifikasi Pembayaran
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Pending Payments Dialog */}
      <PendingPaymentsDialog
        open={showPendingPayments}
        onOpenChange={setShowPendingPayments}
      />
    </div>
  );
}

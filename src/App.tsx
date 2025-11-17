import { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ResidentDashboard } from './components/ResidentDashboard';
import { AdminRegistration } from './components/auth/AdminRegistration';
import { ResidentRegistration } from './components/auth/ResidentRegistration';
import { AdminLogin } from './components/auth/AdminLogin';
import { ResidentLogin } from './components/auth/ResidentLogin';
import { Button } from './components/ui/button';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Building2, Users, Leaf, TrendingUp } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { user, userRole, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'home' | 'login-admin' | 'login-resident' | 'register-admin' | 'register-resident'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (viewMode === 'login-admin') {
      return (
        <AdminLogin
          onSuccess={() => {}}
          onBack={() => setViewMode('home')}
        />
      );
    }

    if (viewMode === 'login-resident') {
      return (
        <ResidentLogin
          onSuccess={() => {}}
          onBack={() => setViewMode('home')}
        />
      );
    }

    if (viewMode === 'register-admin') {
      return (
        <AdminRegistration
          onSuccess={() => {
            alert('Pendaftaran Admin RT berhasil! Silakan login.');
            setViewMode('login-admin');
          }}
          onBack={() => setViewMode('home')}
        />
      );
    }

    if (viewMode === 'register-resident') {
      return (
        <ResidentRegistration
          onSuccess={() => {
            alert('Pendaftaran Warga berhasil! Silakan login.');
            setViewMode('login-resident');
          }}
          onBack={() => setViewMode('home')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-full relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sistem Manajemen RT
            </h1>
            <p className="text-gray-600 text-lg">
              Platform digital untuk kelola iuran dan bank sampah RT Anda
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="mb-1 text-blue-900">Kelola Iuran</h3>
              <p className="text-sm text-gray-600">Pencatatan dan pelacakan iuran warga secara real-time</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-1 text-green-900">Bank Sampah Digital</h3>
              <p className="text-sm text-gray-600">Kelola sampah dan saldo dengan mudah</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="mb-1 text-amber-900">Manajemen Warga</h3>
              <p className="text-sm text-gray-600">Data warga terorganisir dan terintegrasi</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm mb-3 text-gray-700">Masuk ke Akun:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => setViewMode('login-admin')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Login Admin RT
                </Button>
                <Button
                  onClick={() => setViewMode('login-resident')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Login Warga
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Belum punya akun?</span>
              </div>
            </div>

            <div>
              <p className="text-sm mb-3 text-gray-700">Daftar Akun Baru:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => setViewMode('register-admin')}
                  variant="outline"
                  className="w-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all"
                >
                  Daftar sebagai Admin RT
                </Button>
                <Button
                  onClick={() => setViewMode('register-resident')}
                  variant="outline"
                  className="w-full border-2 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all"
                >
                  Daftar sebagai Warga
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'resident') {
    return <ResidentDashboard />;
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}
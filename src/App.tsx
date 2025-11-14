import { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { ResidentDashboard } from './components/ResidentDashboard';
import { AdminRegistration } from './components/auth/AdminRegistration';
import { ResidentRegistration } from './components/auth/ResidentRegistration';
import { Button } from './components/ui/button';

type UserRole = 'admin' | 'resident' | null;
type ViewMode = 'login' | 'register-admin' | 'register-resident';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  if (userRole === null) {
    if (viewMode === 'register-admin') {
      return (
        <AdminRegistration
          onSuccess={() => {
            alert('Pendaftaran Admin RT berhasil! Silakan login.');
            setViewMode('login');
          }}
          onBack={() => setViewMode('login')}
        />
      );
    }

    if (viewMode === 'register-resident') {
      return (
        <ResidentRegistration
          onSuccess={() => {
            alert('Pendaftaran Warga berhasil! Silakan login.');
            setViewMode('login');
          }}
          onBack={() => setViewMode('login')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-center mb-2">Sistem Manajemen RT</h1>
          <p className="text-center text-gray-600 mb-8">
            Pilih role untuk melihat dashboard
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Masuk sebagai:</p>
              <div className="space-y-2">
                <Button
                  onClick={() => setUserRole('admin')}
                  className="w-full"
                  size="lg"
                >
                  Admin RT
                </Button>
                <Button
                  onClick={() => setUserRole('resident')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Warga
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Atau</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Belum punya akun?</p>
              <div className="space-y-2">
                <Button
                  onClick={() => setViewMode('register-admin')}
                  variant="outline"
                  className="w-full"
                >
                  Daftar sebagai Admin RT
                </Button>
                <Button
                  onClick={() => setViewMode('register-resident')}
                  variant="outline"
                  className="w-full"
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
    return <AdminDashboard onLogout={() => setUserRole(null)} />;
  }

  return <ResidentDashboard onLogout={() => setUserRole(null)} />;
}
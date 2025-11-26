import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../utils/supabase/info';
import { AlertCircle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProfile } from '../../lib/supabase';

interface DebugResult {
  adminInfo?: {
    id: string;
    name: string;
    rt: string;
    rw: string;
  };
  allResidents?: any[];
  matchingResidents?: any[];
  error?: string;
}

export function ResidentDebugInfo() {
  const { profile } = useAuth();
  const adminProfile = profile as AdminProfile;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setResult({ error: 'Tidak ada session aktif' });
        return;
      }

      // Get all residents from database (bypassing RT/RW filter for debugging)
      const { data: allResidents, error: allError } = await supabase
        .from('resident_profiles')
        .select('*');

      if (allError) {
        setResult({ error: allError.message });
        return;
      }

      // Filter matching residents
      const matching = allResidents?.filter(r => 
        r.rt === adminProfile?.rt && r.rw === adminProfile?.rw
      ) || [];

      setResult({
        adminInfo: {
          id: adminProfile?.id || '',
          name: adminProfile?.name || '',
          rt: adminProfile?.rt || '',
          rw: adminProfile?.rw || '',
        },
        allResidents: allResidents || [],
        matchingResidents: matching,
      });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-600" />
          Debug: Data Warga
        </CardTitle>
        <CardDescription>
          Diagnosa kenapa data warga tidak muncul
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Mengecek...' : 'Jalankan Diagnostic'}
        </Button>

        {result && (
          <div className="space-y-4">
            {result.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                </div>
              </div>
            )}

            {result.adminInfo && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Info Admin RT:</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Nama:</strong> {result.adminInfo.name}</p>
                  <p><strong>RT:</strong> {result.adminInfo.rt}</p>
                  <p><strong>RW:</strong> {result.adminInfo.rw}</p>
                  <p><strong>ID:</strong> {result.adminInfo.id}</p>
                </div>
              </div>
            )}

            {result.allResidents && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">
                  Total Warga di Database: {result.allResidents.length}
                </h3>
                {result.allResidents.length > 0 ? (
                  <div className="space-y-2 text-sm text-purple-800">
                    {result.allResidents.map((resident, i) => (
                      <div key={i} className="p-2 bg-white rounded border border-purple-100">
                        <p><strong>Nama:</strong> {resident.name}</p>
                        <p><strong>Email:</strong> {resident.email}</p>
                        <p><strong>RT/RW:</strong> {resident.rt}/{resident.rw}</p>
                        <p><strong>No. Rumah:</strong> {resident.house_number}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-purple-700">
                    Tidak ada warga di database. Coba daftarkan warga baru.
                  </p>
                )}
              </div>
            )}

            {result.matchingResidents && (
              <div className={`p-4 rounded-lg border ${
                result.matchingResidents.length > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {result.matchingResidents.length > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      result.matchingResidents.length > 0 
                        ? 'text-green-900' 
                        : 'text-yellow-900'
                    }`}>
                      Warga dengan RT/RW yang Sama: {result.matchingResidents.length}
                    </h3>
                    {result.matchingResidents.length === 0 && (
                      <div className="mt-2 text-sm text-yellow-800 space-y-2">
                        <p><strong>Masalah:</strong> Tidak ada warga dengan RT/RW yang sama dengan Admin!</p>
                        <p><strong>Solusi:</strong></p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Admin RT: <strong>{result.adminInfo?.rt}</strong> / RW: <strong>{result.adminInfo?.rw}</strong></li>
                          <li>Pastikan warga yang didaftarkan memiliki RT/RW yang SAMA</li>
                          <li>Gunakan tombol "Tambah Warga" (RT/RW auto-fill)</li>
                          <li>Atau minta warga daftar dengan RT/RW: {result.adminInfo?.rt}/{result.adminInfo?.rw}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-2">💡 Tips:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Admin hanya bisa melihat warga dengan RT/RW yang SAMA</li>
            <li>Saat admin tambah warga, RT/RW otomatis terisi dari profil admin</li>
            <li>Saat warga daftar sendiri, mereka harus input RT/RW yang BENAR</li>
            <li>Jika RT/RW tidak cocok, warga tidak akan muncul di daftar admin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SessionDebugger() {
  const { session, user, profile, userRole } = useAuth();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkSession = async () => {
    setChecking(true);
    try {
      // Get session from localStorage
      const storedSession = localStorage.getItem('supabase.auth.token');
      
      // Get session from supabase client
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      // Check if expired
      let isExpired = false;
      if (currentSession?.expires_at) {
        isExpired = currentSession.expires_at < Date.now();
      }

      setResult({
        storedSession: storedSession ? JSON.parse(storedSession) : null,
        currentSession,
        error,
        isExpired,
        hasToken: !!currentSession?.access_token,
        authContextSession: session,
        authContextUser: user,
        authContextProfile: profile,
        authContextRole: userRole,
      });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setChecking(false);
    }
  };

  const clearAndRefresh = () => {
    localStorage.removeItem('supabase.auth.token');
    window.location.reload();
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-yellow-600" />
          Session Debugger
        </CardTitle>
        <CardDescription>
          Check session status untuk diagnose masalah autentikasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkSession} 
            disabled={checking}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Session'}
          </Button>
          <Button 
            onClick={clearAndRefresh}
            variant="outline"
            className="flex-1"
          >
            Clear & Reload
          </Button>
        </div>

        {result && (
          <div className="space-y-3">
            {/* Session Status */}
            <div className={`p-3 rounded-lg border ${
              result.hasToken && !result.isExpired
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {result.hasToken && !result.isExpired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    result.hasToken && !result.isExpired
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}>
                    {result.hasToken && !result.isExpired 
                      ? '✅ Session Valid' 
                      : '❌ Session Invalid/Expired'}
                  </p>
                  {result.isExpired && (
                    <p className="text-sm text-red-700">Session expired. Need to login again.</p>
                  )}
                  {!result.hasToken && (
                    <p className="text-sm text-red-700">No access token found. Please login.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Auth Context Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Auth Context:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>User:</strong> {result.authContextUser?.email || 'Not logged in'}</p>
                <p><strong>Role:</strong> {result.authContextRole || 'None'}</p>
                <p><strong>Profile:</strong> {result.authContextProfile?.name || 'Not loaded'}</p>
                <p><strong>Has Session:</strong> {result.authContextSession ? 'Yes ✅' : 'No ❌'}</p>
              </div>
            </div>

            {/* Session Details */}
            {result.currentSession && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Session Details:</h4>
                <div className="space-y-1 text-sm text-purple-800">
                  <p><strong>Access Token:</strong> {result.currentSession.access_token?.substring(0, 30)}...</p>
                  <p><strong>Refresh Token:</strong> {result.currentSession.refresh_token ? 'Present ✅' : 'Missing ❌'}</p>
                  <p><strong>Expires At:</strong> {
                    result.currentSession.expires_at 
                      ? new Date(result.currentSession.expires_at).toLocaleString('id-ID')
                      : 'Unknown'
                  }</p>
                  <p><strong>User ID:</strong> {result.currentSession.user?.id}</p>
                </div>
              </div>
            )}

            {/* LocalStorage Info */}
            {result.storedSession && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">LocalStorage:</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Stored:</strong> Yes ✅</p>
                  <p><strong>Has Access Token:</strong> {result.storedSession.access_token ? 'Yes ✅' : 'No ❌'}</p>
                  <p><strong>Has Refresh Token:</strong> {result.storedSession.refresh_token ? 'Yes ✅' : 'No ❌'}</p>
                </div>
              </div>
            )}

            {/* Error Info */}
            {result.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Error:</h4>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
            )}

            {/* Solution */}
            {(!result.hasToken || result.isExpired) && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">💡 Solusi:</h4>
                <ul className="list-disc ml-5 space-y-1 text-sm text-orange-800">
                  <li>Klik "Clear & Reload" di atas</li>
                  <li>Atau logout dan login kembali</li>
                  <li>Pastikan Email Provider enabled di Supabase</li>
                  <li>Check CRITICAL-ENABLE-EMAIL-PROVIDER.md</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

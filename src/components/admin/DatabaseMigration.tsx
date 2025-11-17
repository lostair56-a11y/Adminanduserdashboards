import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Database, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner@2.0.3';

export function DatabaseMigration() {
  const [checking, setChecking] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'warning';
    message: string;
  }>({ type: 'idle', message: '' });

  const checkDescriptionColumn = async () => {
    setChecking(true);
    setStatus({ type: 'idle', message: '' });

    try {
      // Try to query the description column
      const { data, error } = await supabase
        .from('fee_payments')
        .select('description')
        .limit(1);

      if (error) {
        if (error.message.includes('description')) {
          setStatus({
            type: 'warning',
            message: 'Kolom description tidak ditemukan di database. Silakan jalankan migration.'
          });
        } else {
          setStatus({
            type: 'error',
            message: `Error: ${error.message}`
          });
        }
      } else {
        setStatus({
          type: 'success',
          message: 'Kolom description sudah ada di database! Tidak perlu migration.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Gagal memeriksa database: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setChecking(false);
    }
  };

  const runMigration = () => {
    setMigrating(true);
    
    // Show instructions since we can't run ALTER TABLE from client
    setStatus({
      type: 'warning',
      message: 'Migration harus dijalankan dari Supabase Dashboard. Lihat file CARA-MENJALANKAN-MIGRATION.md untuk instruksi lengkap.'
    });

    // Open documentation in new tab
    const instructions = `
LANGKAH-LANGKAH MIGRATION:

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik "SQL Editor" di sidebar
4. Klik "New Query"
5. Copy dan paste query berikut:

ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS description TEXT;

6. Klik tombol "Run" atau tekan Ctrl+Enter
7. Refresh halaman ini dan klik "Cek Status" untuk verifikasi
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText('ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS description TEXT;')
      .then(() => {
        toast.success('SQL Query sudah dicopy ke clipboard!');
      })
      .catch(() => {
        toast.error('Gagal copy ke clipboard');
      });

    setTimeout(() => {
      setMigrating(false);
    }, 1000);
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Migration - Kolom Description
        </CardTitle>
        <CardDescription>
          Tool untuk memeriksa dan menambahkan kolom description ke tabel fee_payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={checkDescriptionColumn}
            disabled={checking || migrating}
            variant="outline"
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memeriksa...
              </>
            ) : (
              'Cek Status'
            )}
          </Button>

          <Button
            onClick={runMigration}
            disabled={checking || migrating || status.type === 'success'}
            variant="default"
          >
            {migrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Copy SQL Query'
            )}
          </Button>

          <Button
            onClick={openSupabaseDashboard}
            variant="secondary"
          >
            Buka Supabase Dashboard
          </Button>
        </div>

        {status.message && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            <div className="flex items-start gap-2">
              {getStatusIcon()}
              <div className="flex-1">
                <AlertTitle>
                  {status.type === 'success' && 'Berhasil'}
                  {status.type === 'error' && 'Error'}
                  {status.type === 'warning' && 'Perhatian'}
                </AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {status.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="font-medium">Instruksi Manual:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Klik tombol "Buka Supabase Dashboard"</li>
            <li>Login dan pilih project Anda</li>
            <li>Klik "SQL Editor" di sidebar kiri</li>
            <li>Klik "New Query"</li>
            <li>Klik "Copy SQL Query" di atas (akan otomatis copy ke clipboard)</li>
            <li>Paste query di SQL Editor dan klik "Run"</li>
            <li>Kembali ke halaman ini dan klik "Cek Status"</li>
          </ol>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">SQL Query:</p>
          <code className="text-sm text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900 p-2 rounded block">
            ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS description TEXT;
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

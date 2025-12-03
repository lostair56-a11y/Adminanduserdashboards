import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Bell, Calendar, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  read: boolean;
  created_at: string;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/notifications`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!session?.access_token) return;

    try {
      
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertCircle;
      case 'success':
        return CheckCircle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const iconColors = {
    warning: 'text-amber-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  const bgColors = {
    warning: 'bg-amber-50',
    success: 'bg-green-50',
    info: 'bg-blue-50',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <DialogTitle>Notifikasi</DialogTitle>
          </div>
          <DialogDescription>Informasi dan pengingat terbaru untuk Anda</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="rounded-full h-8 w-8 border-b-2 border-blue-600"
              />
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada notifikasi</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => {
                const Icon = getIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      notification.read 
                        ? 'border-gray-200 bg-white hover:bg-gray-50' 
                        : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.1, type: 'spring' }}
                        className={`p-2 rounded-lg ${bgColors[notification.type]} h-fit`}
                      >
                        <Icon
                          className={`h-5 w-5 ${iconColors[notification.type]}`}
                        />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className={notification.read ? '' : 'font-semibold'}>{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="ml-2">Baru</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
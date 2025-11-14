import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Bell, Calendar, CheckCircle, Info } from 'lucide-react';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  // Empty initial state - data will be fetched from backend
  const notifications: Array<{
    id: string;
    icon: any;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: string;
  }> = [];

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
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`p-2 rounded-lg ${bgColors[notification.type as keyof typeof bgColors]} h-fit`}
                    >
                      <Icon
                        className={`h-5 w-5 ${iconColors[notification.type as keyof typeof iconColors]}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <p>{notification.title}</p>
                        {!notification.read && <Badge variant="default">Baru</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
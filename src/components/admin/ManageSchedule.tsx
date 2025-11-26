import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Plus, Calendar as CalendarIcon, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { AddScheduleDialog } from './AddScheduleDialog';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: 'scheduled' | 'completed';
}

export function ManageSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const upcomingSchedules = schedules
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    fetchSchedules();
  }, [session]);

  const fetchSchedules = async () => {
    if (!session?.access_token) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/schedules`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
      } else {
        console.error('Error fetching schedules:', await response.text());
        toast.error('Gagal mengambil data jadwal');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal mengambil data jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (scheduleData: { date: string; area: string; time: string; status: 'scheduled' }) => {
  if (!session?.access_token) return;

  try {
    // Pisah jam
    const [jam_mulai, jam_selesai] = scheduleData.time.split(" - ");

    // ID admin dari session
    const adminId = session.user.id;

    const payload = {
      jenis: "Pengangkutan Sampah",
      tanggal: scheduleData.date,
      jam_mulai,
      jam_selesai,
      lokasi: scheduleData.area,
      status: "aktif",
      admin_id: adminId
    };

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/schedules/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      toast.success('Jadwal berhasil ditambahkan');
      fetchSchedules();
      setShowAddDialog(false);
    } else {
      const error = await response.json();
      toast.error(error.error || 'Gagal menambahkan jadwal');
    }
  } catch (error) {
    console.error('Error adding schedule:', error);
    toast.error('Gagal menambahkan jadwal');
  }
};

  const handleMarkComplete = async (scheduleId: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/schedules/${scheduleId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      );

      if (response.ok) {
        toast.success('Jadwal ditandai selesai');
        fetchSchedules();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengupdate jadwal');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Gagal mengupdate jadwal');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!session?.access_token) return;

    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/schedules/${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Jadwal berhasil dihapus');
        fetchSchedules();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus jadwal');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus jadwal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Kalender Pengangkutan</CardTitle>
            <CardDescription>Pilih tanggal untuk melihat atau menambah jadwal</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Jadwal Mendatang</CardTitle>
                <CardDescription>Pengangkutan sampah yang dijadwalkan</CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada jadwal</p>
                </div>
              ) : (
                upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(schedule.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="mt-1">{schedule.area}</p>
                      </div>
                      <Badge variant="outline">{schedule.time}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkComplete(schedule.id)}
                        title="Tandai Selesai"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        title="Hapus Jadwal"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Semua Jadwal</CardTitle>
          <CardDescription>Riwayat lengkap jadwal pengangkutan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada jadwal</p>
              </div>
            ) : (
              schedules
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[3rem]">
                        <p className="text-sm text-gray-600">
                          {new Date(schedule.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(schedule.date).toLocaleDateString('id-ID', {
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <div>
                        <p>{schedule.area}</p>
                        <p className="text-sm text-gray-600">{schedule.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.status === 'completed' ? 'default' : 'outline'}>
                        {schedule.status === 'completed' ? 'Selesai' : 'Terjadwal'}
                      </Badge>
                      {schedule.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkComplete(schedule.id)}
                          title="Tandai Selesai"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddScheduleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddSchedule}
      />
    </div>
  );
}
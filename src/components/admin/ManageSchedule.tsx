import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Plus, Calendar as CalendarIcon, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { AddScheduleDialog } from './AddScheduleDialog';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';
import { getTrashSchedules, createTrashSchedule, updateSchedule, deleteSchedule } from '../../lib/db-helpers';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedCard } from '../animations/AnimatedCard';
import { FloatingElement } from '../animations/FloatingElement';
import { StaggerContainer, StaggerItem } from '../animations/StaggerContainer';
import { GlowingBadge } from '../animations/GlowingBadge';

interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
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
    setLoading(true);
    try {
      console.log('Fetching schedules using direct query');
      const schedules = await getTrashSchedules();
      console.log('Schedules fetched:', schedules.length);
      setSchedules(schedules);
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      toast.error('Gagal mengambil data jadwal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (scheduleData: { date: string; area: string; time: string; notes?: string }) => {
    try {
      console.log('Creating schedule:', scheduleData);
      await createTrashSchedule(scheduleData);
      toast.success('Jadwal berhasil ditambahkan');
      fetchSchedules();
      setShowAddDialog(false);
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      toast.error('Gagal menambahkan jadwal: ' + error.message);
    }
  };

  const handleMarkComplete = async (scheduleId: string) => {
    try {
      console.log('Marking schedule as completed:', scheduleId);
      await updateSchedule(scheduleId, { status: 'completed' });
      toast.success('Jadwal ditandai selesai');
      fetchSchedules();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast.error('Gagal mengupdate jadwal: ' + error.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      console.log('Deleting schedule:', scheduleId);
      await deleteSchedule(scheduleId);
      toast.success('Jadwal berhasil dihapus');
      fetchSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast.error('Gagal menghapus jadwal: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <AnimatedCard variant="slide" delay={0.1}>
          <Card className="border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FloatingElement duration={2}>
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                </FloatingElement>
                Kalender Pengangkutan
              </CardTitle>
              <CardDescription>Pilih tanggal untuk melihat atau menambah jadwal</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </motion.div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Upcoming Schedules */}
        <AnimatedCard variant="slide" delay={0.2}>
          <Card className="border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FloatingElement duration={2.5} delay={0.3}>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </FloatingElement>
                    Jadwal Mendatang
                  </CardTitle>
                  <CardDescription>Pengangkutan sampah yang dijadwalkan</CardDescription>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setShowAddDialog(true)} className="shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length === 0 ? (
                <motion.div 
                  className="text-center py-8 text-gray-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada jadwal</p>
                </motion.div>
              ) : (
                <StaggerContainer className="space-y-4">
                  {upcomingSchedules.map((schedule, index) => (
                    <StaggerItem key={schedule.id}>
                      <motion.div
                        className="p-4 border border-gray-200 rounded-lg"
                        whileHover={{ 
                          scale: 1.02, 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          backgroundColor: 'rgba(249, 250, 251, 1)'
                        }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <motion.p 
                              className="text-sm text-gray-600"
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {new Date(schedule.date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </motion.p>
                            <motion.p 
                              className="mt-1"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {schedule.area}
                            </motion.p>
                          </div>
                          <GlowingBadge variant="outline" glowColor="rgba(59, 130, 246, 0.3)">
                            {schedule.time}
                          </GlowingBadge>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                          </motion.div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
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
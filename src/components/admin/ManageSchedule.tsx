import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { AddScheduleDialog } from './AddScheduleDialog';

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

  // Empty initial state - data will be fetched from backend
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const upcomingSchedules = schedules
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
            {schedules
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
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
                  <Badge variant={schedule.status === 'completed' ? 'default' : 'outline'}>
                    {schedule.status === 'completed' ? 'Selesai' : 'Terjadwal'}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <AddScheduleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={(schedule) => {
          setSchedules([...schedules, { ...schedule, id: Date.now().toString() }]);
          setShowAddDialog(false);
        }}
      />
    </div>
  );
}
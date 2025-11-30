import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (schedule: { date: string; area: string; time: string; notes?: string }) => void;
}

// Preset waktu untuk kemudahan pemilihan
const TIME_PRESETS = [
  '06:00 - 08:00',
  '07:00 - 09:00',
  '08:00 - 10:00',
  '09:00 - 11:00',
  '13:00 - 15:00',
  '14:00 - 16:00',
  '15:00 - 17:00',
];

// Preset area/blok yang umum
const AREA_PRESETS = [
  'Blok A',
  'Blok B',
  'Blok C',
  'Blok D',
  'Seluruh Area RT',
];

export function AddScheduleDialog({ open, onOpenChange, onAdd }: AddScheduleDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    area: '',
    time: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomArea, setUseCustomArea] = useState(false);
  const [useCustomTime, setUseCustomTime] = useState(false);

  // Dapatkan tanggal minimum (hari ini)
  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi tanggal tidak boleh masa lalu
    if (formData.date < minDate) {
      alert('Tanggal tidak boleh di masa lalu!');
      return;
    }

    // Validasi semua field terisi
    if (!formData.date || !formData.area || !formData.time) {
      alert('Semua field harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({ ...formData });
      // Reset form setelah berhasil
      setFormData({ date: new Date().toISOString().split('T')[0], area: '', time: '', notes: '' });
      setUseCustomArea(false);
      setUseCustomTime(false);
    } catch (error) {
      console.error('Error adding schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form saat cancel
    setFormData({ date: new Date().toISOString().split('T')[0], area: '', time: '', notes: '' });
    setUseCustomArea(false);
    setUseCustomTime(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Pengangkutan</DialogTitle>
          <DialogDescription>Buat jadwal pengangkutan sampah baru</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tanggal */}
          <div>
            <Label htmlFor="schedule-date">Tanggal</Label>
            <Input
              id="schedule-date"
              type="date"
              min={minDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          {/* Area/Blok */}
          <div>
            <Label htmlFor="area">Area/Blok</Label>
            <div className="space-y-2 mt-1">
              {!useCustomArea ? (
                <>
                  <Select
                    value={formData.area}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setUseCustomArea(true);
                        setFormData({ ...formData, area: '' });
                      } else {
                        setFormData({ ...formData, area: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih area/blok" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREA_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Input Manual...</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Contoh: Blok A (No. 1-20)"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomArea(false);
                      setFormData({ ...formData, area: '' });
                    }}
                  >
                    Preset
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Waktu */}
          <div>
            <Label htmlFor="time">Waktu</Label>
            <div className="space-y-2 mt-1">
              {!useCustomTime ? (
                <>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setUseCustomTime(true);
                        setFormData({ ...formData, time: '' });
                      } else {
                        setFormData({ ...formData, time: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Input Manual...</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="Contoh: 07:00 - 09:00"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomTime(false);
                      setFormData({ ...formData, time: '' });
                    }}
                  >
                    Preset
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Pengangkutan rutin"
              className="mt-1"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !formData.date || !formData.area || !formData.time}
            >
              {isSubmitting ? 'Menambahkan...' : 'Tambah Jadwal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (schedule: { date: string; area: string; time: string; status: 'scheduled' }) => void;
}

export function AddScheduleDialog({ open, onOpenChange, onAdd }: AddScheduleDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    area: '',
    time: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, status: 'scheduled' });
    setFormData({ date: new Date().toISOString().split('T')[0], area: '', time: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Pengangkutan</DialogTitle>
          <DialogDescription>Buat jadwal pengangkutan sampah baru</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="schedule-date">Tanggal</Label>
            <Input
              id="schedule-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="area">Area/Blok</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="Contoh: Blok A (No. 1-20)"
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Waktu</Label>
            <Input
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="Contoh: 07:00 - 09:00"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" className="flex-1">
              Tambah Jadwal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

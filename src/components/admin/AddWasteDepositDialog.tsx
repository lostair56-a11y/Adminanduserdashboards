import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { getResidents, createWasteDeposit } from '../../lib/db-helpers';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedInput, AnimatedNumberInput } from '../animations/AnimatedInput';
import { LoadingSkeleton } from '../animations/LoadingSkeleton';
import { SuccessCelebration } from '../animations/ConfettiEffect';

interface AddWasteDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
}

const wasteTypes = [
  { value: 'Plastik', price: 3000 },
  { value: 'Kertas', price: 2000 },
  { value: 'Botol Kaca', price: 1500 },
  { value: 'Kaleng', price: 4000 },
  { value: 'Kardus', price: 2500 },
];

interface Resident {
  id: string;
  name: string;
  house_number: string;
}

export function AddWasteDepositDialog({ open, onOpenChange, onAdd }: AddWasteDepositDialogProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [formData, setFormData] = useState({
    residentId: '',
    wasteType: '',
    weight: 0,
    pricePerKg: 0,
  });

  useEffect(() => {
    if (open) {
      fetchResidents();
    }
  }, [open]);

  const fetchResidents = async () => {
    setLoadingResidents(true);
    try {
      const data = await getResidents();
      setResidents(data as any);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoadingResidents(false);
    }
  };

  const handleWasteTypeChange = (value: string) => {
    const wasteType = wasteTypes.find((w) => w.value === value);
    setFormData({
      ...formData,
      wasteType: value,
      pricePerKg: wasteType?.price || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.residentId) {
      toast.error('Silakan pilih warga terlebih dahulu');
      return;
    }
    
    if (!formData.wasteType) {
      toast.error('Silakan pilih jenis sampah terlebih dahulu');
      return;
    }
    
    if (formData.weight <= 0) {
      toast.error('Berat sampah harus lebih dari 0 kg');
      return;
    }
    
    setLoading(true);

    try {
      const totalValue = formData.weight * formData.pricePerKg;
      
      await createWasteDeposit({
        resident_id: formData.residentId,
        waste_type: formData.wasteType,
        weight_kg: formData.weight,
        value: totalValue,
        deposit_date: new Date().toISOString()
      });

      // Show celebration
      setShowCelebration(true);
      
      toast.success(`Setoran berhasil ditambahkan. Nilai: Rp ${totalValue.toLocaleString('id-ID')}`);
      
      // Reset and close after celebration
      setTimeout(() => {
        setShowCelebration(false);
        setFormData({
          residentId: '',
          wasteType: '',
          weight: 0,
          pricePerKg: 0,
        });
        onAdd();
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding deposit:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal menambahkan setoran');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = formData.weight * formData.pricePerKg;

  return (
    <>
      <SuccessCelebration 
        show={showCelebration} 
        message="Setoran Berhasil!"
        onComplete={() => setShowCelebration(false)}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Setoran Sampah</DialogTitle>
            <DialogDescription>Catat setoran sampah dari warga</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {loadingResidents ? (
              <div className="space-y-4">
                <LoadingSkeleton variant="input" />
                <LoadingSkeleton variant="input" />
                <LoadingSkeleton variant="input" />
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="resident">Nama Warga</Label>
                  <Select value={formData.residentId} onValueChange={(value) => setFormData({ ...formData, residentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih warga" />
                    </SelectTrigger>
                    <SelectContent>
                      {residents.map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.name} - Rumah {resident.house_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="wasteType">Jenis Sampah</Label>
                  <Select value={formData.wasteType} onValueChange={handleWasteTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis sampah" />
                    </SelectTrigger>
                    <SelectContent>
                      {wasteTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.value} - Rp {type.price.toLocaleString('id-ID')}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AnimatedNumberInput
                    label="Berat (kg)"
                    value={formData.weight}
                    onChange={(value) => setFormData({ ...formData, weight: value })}
                    step="0.1"
                    placeholder="0"
                    required
                  />
                </motion.div>

                <AnimatePresence>
                  {formData.wasteType && formData.weight > 0 && (
                    <motion.div 
                      className="p-4 bg-green-50 border border-green-200 rounded-lg"
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <p className="text-sm text-gray-600">Total Nilai</p>
                      <motion.p 
                        className="text-2xl text-green-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                      >
                        Rp {totalValue.toLocaleString('id-ID')}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
              </motion.div>
              <motion.div 
                className="flex-1" 
                whileTap={{ scale: 0.98 }}
                whileHover={{ 
                  scale: loading || !formData.residentId || !formData.wasteType || formData.weight <= 0 ? 1 : 1.02 
                }}
              >
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !formData.residentId || !formData.wasteType || formData.weight <= 0}
                >
                  {loading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Menyimpan...
                    </motion.span>
                  ) : (
                    'Tambah Setoran'
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
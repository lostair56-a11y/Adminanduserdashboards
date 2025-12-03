import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertCircle, 
  CreditCard, 
  Leaf, 
  Calendar, 
  History, 
  Wallet, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { AnimatedCard } from '../animations/AnimatedCard';
import { FloatingElement } from '../animations/FloatingElement';
import { StaggerContainer, StaggerItem } from '../animations/StaggerContainer';
import { GlowingBadge } from '../animations/GlowingBadge';

interface FeeRecord {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'unpaid' | 'pending';
  description?: string;
}

interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: string;
}

interface AnimatedDashboardContentProps {
  loading: boolean;
  unpaidFees: FeeRecord[];
  paidFees: FeeRecord[];
  totalFees: number;
  wasteBankBalance: number;
  nextSchedule: Schedule | null;
  nextCollection: string;
  schedulesLoading: boolean;
  onPayFee: (feeId: string, amount: number) => void;
  onPayWithWasteBank: (feeId: string, amount: number) => void;
  onNavigateToWasteBank: () => void;
}

export function AnimatedDashboardContent({
  loading,
  unpaidFees,
  paidFees,
  totalFees,
  wasteBankBalance,
  nextSchedule,
  nextCollection,
  schedulesLoading,
  onPayFee,
  onPayWithWasteBank,
  onNavigateToWasteBank
}: AnimatedDashboardContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Unpaid Bills Section */}
      {loading ? (
        <Card>
          <CardContent className=\"py-12\">
            <div className=\"text-center\">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className=\"rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"
              />
              <p className=\"text-gray-600\">Memuat tagihan...</p>
            </div>
          </CardContent>
        </Card>
      ) : unpaidFees.length > 0 ? (
        <AnimatedCard variant="bounce" className="border-l-4 border-l-red-500 shadow-2xl">
          <Card className="border-0">
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <FloatingElement duration={2}>
                  <motion.div 
                    className=\"p-2 bg-red-100 rounded-lg\"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle className=\"h-6 w-6 text-red-600\" />
                  </motion.div>
                </FloatingElement>
                <div>
                  <CardTitle>Tagihan Belum Dibayar</CardTitle>
                  <CardDescription>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Anda memiliki {unpaidFees.length} tagihan yang belum dibayar
                    </motion.span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StaggerContainer className="space-y-3">
                {unpaidFees.map((fee, index) => (
                  <StaggerItem key={fee.id}>
                    <motion.div 
                      className=\"p-4 bg-red-50 border border-red-200 rounded-lg\"
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: '0 10px 30px rgba(220, 38, 38, 0.15)',
                        transition: { type: 'spring', stiffness: 300 }
                      }}
                    >
                      <div className=\"flex items-center justify-between mb-2\">
                        <div>
                          <p className=\"text-sm text-gray-600\">Periode</p>
                          <p className=\"font-medium\">{fee.month} {fee.year}</p>
                        </div>
                        <GlowingBadge variant="destructive" glowColor="rgba(220, 38, 38, 0.5)">
                          Belum Bayar
                        </GlowingBadge>
                      </div>
                      <div className=\"mb-2\">
                        <p className=\"text-sm text-gray-600\">Jumlah Tagihan</p>
                        <motion.p 
                          className=\"text-xl text-red-600\"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Rp {fee.amount.toLocaleString('id-ID')}
                        </motion.p>
                      </div>
                      {fee.description && (
                        <div className=\"mb-3\">
                          <p className=\"text-sm text-gray-600\">Keterangan</p>
                          <p className=\"text-sm\">{fee.description}</p>
                        </div>
                      )}
                      <div className=\"space-y-2\">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className=\"w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg\"
                            onClick={() => onPayFee(fee.id, fee.amount)}
                          >
                            <CreditCard className=\"h-4 w-4 mr-2\" />
                            Bayar via Bank BRI
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant=\"outline\"
                            className=\"w-full\"
                            onClick={() => onPayWithWasteBank(fee.id, fee.amount)}
                            disabled={wasteBankBalance < fee.amount}
                          >
                            <Wallet className=\"h-4 w-4 mr-2\" />
                            Gunakan Saldo Bank Sampah
                          </Button>
                        </motion.div>
                        {wasteBankBalance < fee.amount && (
                          <motion.p 
                            className=\"text-xs text-amber-600\"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            Saldo bank sampah tidak mencukupi
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </CardContent>
          </Card>
        </AnimatedCard>
      ) : (
        <AnimatedCard variant="scale" className="border-l-4 border-l-green-500 shadow-xl">
          <Card className="border-0">
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <motion.div 
                  className=\"p-2 bg-green-100 rounded-lg\"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CreditCard className=\"h-6 w-6 text-green-600\" />
                </motion.div>
                <div>
                  <CardTitle>Status Pembayaran</CardTitle>
                  <CardDescription>Semua tagihan sudah lunas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className=\"text-center py-6\"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.p 
                  className=\"text-green-600 text-lg\"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✓ Tidak ada tagihan yang belum dibayar
                </motion.p>
              </motion.div>
            </CardContent>
          </Card>
        </AnimatedCard>
      )}

      {/* Waste Bank & Schedule Grid */}
      <div className=\"grid gap-6 lg:grid-cols-2\">
        {/* Waste Bank Module */}
        <AnimatedCard variant="slide" delay={0.2} className="shadow-2xl border-t-4 border-t-green-500">
          <Card className="border-0 overflow-hidden relative">
            {/* Floating sparkles */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-green-400 opacity-50" />
            </motion.div>
            
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <FloatingElement duration={2.5}>
                  <div className=\"p-2 bg-green-100 rounded-lg\">
                    <Leaf className=\"h-6 w-6 text-green-600\" />
                  </div>
                </FloatingElement>
                <div>
                  <CardTitle>Bank Sampah Digital</CardTitle>
                  <CardDescription>Saldo Anda saat ini</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <motion.div 
                className=\"p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-2xl relative overflow-hidden\"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: '0 20px 60px rgba(34, 197, 94, 0.4)'
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-30"
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                
                <p className=\"text-sm opacity-90 mb-1 relative z-10\">Total Saldo</p>
                <motion.p 
                  className=\"text-3xl relative z-10\"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Rp {wasteBankBalance.toLocaleString('id-ID')}
                </motion.p>
              </motion.div>

              <motion.button
                onClick={onNavigateToWasteBank}
                className=\"w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors\"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className=\"text-sm\">Riwayat Transaksi Bank Sampah</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className=\"h-4 w-4\" />
                </motion.div>
              </motion.button>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Schedule Module */}
        <AnimatedCard variant="slide" delay={0.3} className="shadow-2xl border-t-4 border-t-amber-500">
          <Card className="border-0">
            <CardHeader>
              <div className=\"flex items-center gap-3\">
                <FloatingElement duration={3} delay={0.5}>
                  <div className=\"p-2 bg-amber-100 rounded-lg\">
                    <Calendar className=\"h-6 w-6 text-amber-600\" />
                  </div>
                </FloatingElement>
                <div>
                  <CardTitle>Informasi & Jadwal</CardTitle>
                  <CardDescription>Jadwal pengangkutan sampah</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className=\"text-center py-6\">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className=\"rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"
                  />
                  <p className=\"text-gray-600\">Memuat jadwal...</p>
                </div>
              ) : nextSchedule ? (
                <motion.div 
                  className=\"p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200\"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 15px 40px rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <div className=\"flex items-center gap-4\">
                    <FloatingElement>
                      <div className=\"p-3 bg-white rounded-lg shadow-sm\">
                        <Calendar className=\"h-8 w-8 text-amber-600\" />
                      </div>
                    </FloatingElement>
                    <div>
                      <p className=\"text-sm text-gray-600 mb-1\">Jadwal Pengangkutan Berikutnya</p>
                      <motion.p 
                        className=\"text-xl text-gray-900\"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {nextCollection}
                      </motion.p>
                      <p className=\"text-sm text-gray-600 mt-1\">
                        Harap siapkan sampah Anda sebelum pukul 07:00 WIB
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className=\"text-center py-6 text-gray-500\"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <History className=\"h-12 w-12 mx-auto mb-2 text-gray-300\" />
                  <p>Belum ada jadwal pengangkutan</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>

      {/* Quick Stats */}
      <StaggerContainer className=\"grid gap-6 md:grid-cols-3\" staggerDelay={0.1}>
        <StaggerItem>
          <AnimatedCard variant="scale" delay={0.4} hover={true}>
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-shadow">
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm\">Total Tagihan</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className=\"text-2xl\"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                >
                  {totalFees}
                </motion.div>
                <p className=\"text-xs text-gray-600 mt-1\">Semua periode</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard variant="scale" delay={0.5} hover={true}>
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-shadow">
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm\">Sudah Dibayar</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className=\"text-2xl text-green-600\"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                >
                  {paidFees.length}
                </motion.div>
                <p className=\"text-xs text-gray-600 mt-1\">Tagihan lunas</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard variant="scale" delay={0.6} hover={true}>
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-shadow">
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm\">Belum Dibayar</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className=\"text-2xl text-red-600\"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.7 }}
                >
                  {unpaidFees.length}
                </motion.div>
                <p className=\"text-xs text-gray-600 mt-1\">Perlu dibayar</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>
    </motion.div>
  );
}

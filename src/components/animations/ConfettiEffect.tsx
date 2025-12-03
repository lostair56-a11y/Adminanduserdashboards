import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
  '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
  '#e17055', '#00b894', '#0984e3', '#e84393'
];

export function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti
    confettiRef.current = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    let startTime = Date.now();
    const duration = 3000; // 3 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        onComplete?.();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiRef.current.forEach((confetti) => {
        // Update position
        confetti.x += confetti.velocityX;
        confetti.y += confetti.velocityY;
        confetti.velocityY += 0.1; // Gravity
        confetti.rotation += confetti.rotationSpeed;

        // Draw confetti
        ctx.save();
        ctx.translate(confetti.x, confetti.y);
        ctx.rotate((confetti.rotation * Math.PI) / 180);
        ctx.fillStyle = confetti.color;
        
        // Draw rectangle confetti
        ctx.fillRect(-confetti.size / 2, -confetti.size / 2, confetti.size, confetti.size);
        
        ctx.restore();
      });

      // Remove confetti that's off screen
      confettiRef.current = confettiRef.current.filter(
        (c) => c.y < canvas.height + 20
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-[9999]"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
}

// Simpler confetti using CSS only (lightweight alternative)
export function SimpleConfetti({ active }: { active: boolean }) {
  if (!active) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
          }}
          initial={{ 
            top: '-10%', 
            rotate: 0,
            opacity: 1 
          }}
          animate={{
            top: '110%',
            rotate: 360 * 3,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

// Success celebration with confetti and animated message
export function SuccessCelebration({ 
  show, 
  message = 'Pembayaran Berhasil!',
  onComplete 
}: { 
  show: boolean; 
  message?: string;
  onComplete?: () => void;
}) {
  return (
    <>
      <ConfettiEffect active={show} onComplete={onComplete} />
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-[9998] pointer-events-none"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
            >
              <motion.svg
                className="w-10 h-10 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.path d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl text-center text-gray-800"
            >
              {message}
            </motion.h2>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

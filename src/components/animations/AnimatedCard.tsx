import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  variant?: 'fade' | 'slide' | 'scale' | 'bounce' | 'glow';
  className?: string;
  hover?: boolean;
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  variant = 'fade',
  className = '',
  hover = true
}: AnimatedCardProps) {
  const variants = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay }
    },
    slide: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6, delay, type: 'spring', stiffness: 100 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay, type: 'spring', stiffness: 200 }
    },
    bounce: {
      initial: { opacity: 0, y: -100 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, delay, type: 'spring', stiffness: 150, damping: 10 }
    },
    glow: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6, delay }
    }
  };

  const hoverVariants = {
    scale: { scale: 1.05, y: -5 },
    rotate: { scale: 1.03, rotate: 1 },
    glow: { scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }
  };

  const config = variants[variant];

  return (
    <motion.div
      initial={config.initial}
      animate={config.animate}
      transition={config.transition}
      whileHover={hover ? hoverVariants.glow : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

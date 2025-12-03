import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ReactNode } from 'react';

interface PulsingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function PulsingButton({ 
  children, 
  onClick,
  className = '',
  variant = 'default',
  disabled = false
}: PulsingButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <Button 
        onClick={onClick} 
        className={className} 
        variant={variant}
        disabled={disabled}
      >
        {children}
      </Button>
    </motion.div>
  );
}

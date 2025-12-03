import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { ReactNode } from 'react';

interface GlowingBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  glowColor?: string;
}

export function GlowingBadge({ 
  children, 
  variant = 'default',
  glowColor = 'rgba(59, 130, 246, 0.5)'
}: GlowingBadgeProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 5px ${glowColor}`,
          `0 0 20px ${glowColor}`,
          `0 0 5px ${glowColor}`,
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="inline-block rounded-full"
    >
      <Badge variant={variant}>{children}</Badge>
    </motion.div>
  );
}

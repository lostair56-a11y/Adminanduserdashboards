import { motion } from 'motion/react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'circle' | 'button' | 'input' | 'bankinfo';
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ variant = 'text', className = '', count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const getSkeletonClasses = () => {
    switch (variant) {
      case 'card':
        return 'h-32 w-full rounded-lg';
      case 'text':
        return 'h-4 w-full rounded';
      case 'circle':
        return 'h-12 w-12 rounded-full';
      case 'button':
        return 'h-10 w-full rounded-lg';
      case 'input':
        return 'h-10 w-full rounded-md';
      case 'bankinfo':
        return 'h-48 w-full rounded-lg';
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {skeletons.map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative overflow-hidden bg-gray-200 ${getSkeletonClasses()}`}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{
              translateX: ['100%', '-100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Specialized skeleton for bank account info
export function BankAccountSkeleton() {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <LoadingSkeleton variant="circle" className="!h-10 !w-10" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="!h-3 !w-20" />
          <LoadingSkeleton variant="text" className="!h-4 !w-32" />
          <LoadingSkeleton variant="text" className="!h-3 !w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="!h-3 !w-32" />
        <LoadingSkeleton variant="input" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="!h-3 !w-24" />
        <LoadingSkeleton variant="input" />
      </div>
    </div>
  );
}

// Card skeleton with shimmer
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <LoadingSkeleton variant="card" />
        </motion.div>
      ))}
    </div>
  );
}

import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useState, useRef, useEffect, forwardRef } from 'react';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const scale = useMotionValue(1);

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className="block text-sm mb-1.5 transition-colors"
            animate={{
              color: isFocused ? '#2563eb' : error ? '#ef4444' : '#374151',
            }}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          className="relative"
          style={{ scale }}
          whileTap={{ scale: 0.995 }}
        >
          <motion.div
            className="absolute -inset-0.5 rounded-md opacity-0 transition-opacity"
            animate={{
              opacity: isFocused ? 1 : 0,
              background: isFocused
                ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)'
                : 'transparent',
            }}
            style={{
              filter: 'blur(8px)',
            }}
          />
          <Input
            ref={ref}
            className={`relative bg-white ${className}`}
            onFocus={(e) => {
              setIsFocused(true);
              animate(scale, 1.02, { duration: 0.2 });
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              animate(scale, 1, { duration: 0.2 });
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className="block text-sm mb-1.5 transition-colors"
            animate={{
              color: isFocused ? '#2563eb' : error ? '#ef4444' : '#374151',
            }}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          className="relative"
          whileTap={{ scale: 0.995 }}
        >
          <motion.div
            className="absolute -inset-0.5 rounded-md opacity-0 transition-opacity"
            animate={{
              opacity: isFocused ? 1 : 0,
              background: isFocused
                ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)'
                : 'transparent',
            }}
            style={{
              filter: 'blur(8px)',
            }}
          />
          <Textarea
            ref={ref}
            className={`relative bg-white ${className}`}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-1"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

AnimatedTextarea.displayName = 'AnimatedTextarea';

// Animated Number Input with particle effect on value change
export function AnimatedNumberInput({ 
  value, 
  onChange, 
  label,
  ...props 
}: AnimatedInputProps & { value: number; onChange: (value: number) => void }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>();
  const containerRef = useRef<HTMLDivElement>(null);

  const createParticles = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.width / 2,
      y: rect.height / 2,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  useEffect(() => {
    if (value > 0) {
      createParticles();
    }
  }, [value]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatedInput
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        label={label}
        {...props}
      />
      {particles?.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none"
          initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 100,
            y: particle.y - Math.random() * 80,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8 }}
        />
      ))}
    </div>
  );
}

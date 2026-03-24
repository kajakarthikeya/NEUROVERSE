import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`glass rounded-3xl p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

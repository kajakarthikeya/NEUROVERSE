import { motion } from 'framer-motion';

export function Loader({ label = 'Generating learning experience...', sublabel = '', size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  return (
    <div className={`space-y-4 text-center ${className}`}>
      <div className={`mx-auto rounded-full border border-cyan-400/25 border-t-cyan-200 ${sizeMap[size] || sizeMap.md} animate-spin shadow-neon`} />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-sm uppercase tracking-[0.35em] text-slate-300">{label}</p>
        {sublabel ? <p className="mt-2 text-sm text-slate-500">{sublabel}</p> : null}
      </motion.div>
    </div>
  );
}

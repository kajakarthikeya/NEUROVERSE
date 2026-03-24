import { motion } from 'framer-motion';

export function ProgressBar({ value = 0, label = '', hint = '', className = '' }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-950/80">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-[linear-gradient(90deg,_rgba(34,211,238,0.95),_rgba(59,130,246,0.95),_rgba(139,92,246,0.95))] shadow-neon"
        />
      </div>
      {hint ? <p className="mt-3 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

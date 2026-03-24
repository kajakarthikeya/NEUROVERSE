import { motion, AnimatePresence } from 'framer-motion';

/**
 * Renders floating +XP toasts.
 * Use inside a positioned relative container or viewport-fixed container.
 * 
 * items: Array of { id: string|number, amount: number, x: number, y: number }
 */
export function XPToastLayer({ items = [] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: item.y || 0, x: item.x || '50%', scale: 0.8 }}
            animate={{ opacity: 1, y: (item.y || 0) - 60, scale: 1.2 }}
            exit={{ opacity: 0, y: (item.y || 0) - 100, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-20 flex items-center justify-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 text-3xl drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
            style={{ 
              left: item.x !== undefined ? `${item.x}px` : '50%',
              top: item.y !== undefined ? `${item.y}px` : 'auto'
            }}
          >
            +{item.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

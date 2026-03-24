import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export function BreakReminder({ isOpen, onContinue, onTakeBreak }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md px-4"
          >
            <Card className="relative overflow-hidden bg-slate-900/90 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.2)] p-8 text-center" hover={false}>
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400" />
              
              <button 
                onClick={onContinue}
                className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Coffee className="h-8 w-8" />
              </div>

              <h2 className="mb-3 text-2xl font-bold tracking-tight text-white">Time for a Break?</h2>
              
              <p className="mb-8 text-slate-300 leading-relaxed">
                You've been learning for 2 hours. Your brain needs time to consolidate these memories. Take a 10-minute break to stay sharp.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button 
                  onClick={onTakeBreak} 
                  className="w-full sm:w-auto px-8 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                >
                  Take Break
                </Button>
                <Button 
                  onClick={onContinue} 
                  variant="secondary" 
                  className="w-full sm:w-auto px-8 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Continue Learning
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

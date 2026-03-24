import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';

export function SubjectCard({ subject, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <GlassCard className="group relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${subject.accent}`} />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Subject</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{subject.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{subject.lessons} immersive lessons</p>
          </div>
          <Link
            to="/learn"
            className="rounded-full border border-white/10 p-3 text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
            <span>Progress</span>
            <span>{subject.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-900/70">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${subject.accent}`}
              style={{ width: `${subject.progress}%` }}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

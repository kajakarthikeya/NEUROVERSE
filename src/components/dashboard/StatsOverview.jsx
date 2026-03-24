import { motion } from 'framer-motion';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const stats = [
  { key: 'xp', label: 'XP Earned', icon: Sparkles },
  { key: 'level', label: 'Current Level', icon: Trophy },
  { key: 'streak', label: 'Day Streak', icon: Flame },
];

export function StatsOverview({ progress }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-500" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <motion.h3
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 text-3xl font-semibold text-white"
                  >
                    {progress[stat.key]}
                  </motion.h3>
                </div>
                <div className="rounded-2xl border border-cyan-300/15 bg-white/5 p-3 text-cyan-200 shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <ProgressBar
                value={stat.key === 'xp' ? Math.min(100, (progress.xp % 100) || 100) : stat.key === 'level' ? Math.min(100, progress.level * 10) : Math.min(100, progress.streak * 12)}
                label={stat.key === 'xp' ? 'Level progress' : stat.key === 'level' ? 'Mastery curve' : 'Consistency'}
                hint={stat.key === 'xp' ? 'Your next level is charging up.' : stat.key === 'level' ? 'NeuroVerse adapts as you level up.' : 'Daily momentum keeps memory stronger.'}
                className="mt-5"
              />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

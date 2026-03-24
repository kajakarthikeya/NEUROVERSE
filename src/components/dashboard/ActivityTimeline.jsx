import { motion } from 'framer-motion';
import { 
  Compass, Globe, FileText, Star, Award, Zap, Sparkles, 
  Brain, Timer, Target, Flame, Rocket, BookOpen, Layout, MessageSquare, Trophy 
} from 'lucide-react';
import { Card } from '../ui/Card';

const BADGE_MAP = {
  'Neuro Starter': { icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Started your first learning journey' },
  'Quick Thinker': { icon: Timer, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Answered fast within the limit' },
  'Precision Master': { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Achieved a 100% quiz score' },
  'Streak Champion': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Completed 3+ correct in a row' },
  'Explorer': { icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Explored 5+ unique topics' },
  'Deep Learner': { icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Mastered the Deep Study Mode' },
  'Doc Analyzer': { icon: FileText, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', desc: 'Learned from uploaded documents' },
  'Challenge Winner': { icon: Layout, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Conquered the Challenge Mode' },
  'AI Collaborator': { icon: MessageSquare, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', desc: 'Engaged with the AI tutor' },
  'Neuro Master': { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', desc: 'Final elite recognition' },
  // Fallback
  'default': { icon: Sparkles, color: 'text-slate-300', bg: 'bg-white/5', border: 'border-white/10', desc: 'Achievement unlocked' }
};

export function ActivityTimeline({ activity, badges }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <Card hover={false}>
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        <div className="mt-5 space-y-3">
          {activity.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-5 py-4 transition-colors hover:bg-white/5"
            >
              <span className="text-[15px] font-medium text-slate-200">{item.label}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="text-xl font-semibold text-white">Achievements & Badges</h3>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((badgeName, index) => {
            const badge = BADGE_MAP[badgeName] || BADGE_MAP['default'];
            const Icon = badge.icon;
            
            return (
              <motion.div
                key={`${badgeName}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`relative group flex items-start gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10`}
              >
                {/* Visual Glow Effect */}
                <div className={`absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-20 transition-opacity blur-xl ${badge.bg.replace('/10', '/30')}`} />
                
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${badge.bg} ${badge.color} border ${badge.border} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="relative">
                  <h4 className={`text-sm font-bold text-white group-hover:${badge.color} transition-colors uppercase tracking-wider`}>{badgeName}</h4>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium leading-[1.4]">{badge.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

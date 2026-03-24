import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import { getUserProgress } from '../services/progress';

export function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user?.uid) {
        try {
          const data = await getUserProgress(user.uid);
          setProgress(data);
        } catch (error) {
          console.error("Failed to load user progress", error);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const displayProgress = progress || { 
    xp: 0, 
    level: 1, 
    streak: 0, 
    recentActivity: [], 
    badges: ['Explorer'] 
  };

  return (
    <div className="page-shell flex min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      <div className="p-4 lg:p-6 lg:pr-0">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto"
        >
          <header className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
              Explorer Dashboard
            </h1>
            <p className="mt-3 text-lg text-slate-400">
              Welcome to your personal learning node. Track your progress, review concepts, and leap into immersive scenes.
            </p>
          </header>

          <section className="mb-8">
            <StatsOverview progress={displayProgress} />
          </section>

          <section>
            <ActivityTimeline activity={displayProgress.recentActivity || []} badges={displayProgress.badges || []} />
          </section>
        </motion.div>
      </main>
    </div>
  );
}

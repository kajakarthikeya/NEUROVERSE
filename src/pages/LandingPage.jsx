import { motion } from 'framer-motion';
import { ArrowRight, Orbit, Sparkles, Stars } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  return (
    <main className="page-shell relative min-h-screen overflow-hidden px-6 py-16 text-white">
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-glow">
            <Sparkles className="h-4 w-4" />
            VR-ready smart education experience
          </div>
          <h1 className="text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
            Step Into Learning
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            NeuroVerse transforms modern education into a cinematic journey with immersive 3D worlds, AI tutoring,
            adaptive quizzes, and gamified progress built for the next generation of learners.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/auth">
              <Button className="group">
                Enter NeuroVerse
                <ArrowRight className="ml-2 inline h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary">
                Launch Demo
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            { icon: Orbit, title: 'Interactive 3D Worlds', text: 'Explore cinematic knowledge spaces, click objects, and learn through spatial interaction.' },
            { icon: Stars, title: 'AI Tutor + Quiz Coach', text: 'Get instant explanations, revision modes, and tailored quizzes that feel like a personal tutor.' },
            { icon: Sparkles, title: 'Gamified Progress', text: 'Earn XP, unlock levels, detect weak areas, and save a living study library.' },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="h-full">
                <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/15 bg-white/5 p-3 text-cyan-200 shadow-glow">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

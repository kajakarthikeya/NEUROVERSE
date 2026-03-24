import { BookOpen, Brain, Gauge, Lightbulb } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function LearningResult({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <GlassCard>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Topic Title</p>
            <h2 className="text-3xl font-semibold text-white">{result.title}</h2>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2">{result.studyMode || 'Quick Summary'}</span>
          <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2">{result.difficulty || 'Medium'}</span>
        </div>

        <section>
          <h3 className="text-lg font-semibold text-white">Beginner Explanation</h3>
          <p className="mt-2 text-sm text-slate-400">Read this first to understand what the topic is, why it matters, and how to build confidence quickly.</p>
          <p className="mt-3 leading-8 text-slate-300">{result.explanation}</p>
        </section>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard>
          <div className="mb-4 flex items-center gap-3 text-violet-100">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Remember These Points</h3>
          </div>
          <p className="mb-4 text-sm text-slate-400">Use these as quick memory hooks before revision or practice.</p>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            {result.keyPoints.map((point) => (
              <li key={point} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                {point}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-3 text-cyan-100">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Real-life Example</h3>
          </div>
          <p className="text-sm leading-7 text-slate-300">{result.realLifeExample}</p>
        </GlassCard>

        {result.modeGuidance ? (
          <GlassCard>
            <div className="mb-4 flex items-center gap-3 text-cyan-100">
              <Gauge className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-white">Mode Guidance</h3>
            </div>
            <p className="text-sm leading-7 text-slate-300">{result.modeGuidance}</p>
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}

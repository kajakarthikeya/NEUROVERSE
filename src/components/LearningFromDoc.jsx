import { BookText, Brain, Gauge, Lightbulb, Star } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function LearningFromDoc({ result, fileName }) {
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200">
              <BookText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Document Summary</p>
              <h2 className="text-3xl font-semibold text-white">{result.title || fileName}</h2>
              <p className="mt-1 text-sm text-slate-400">Source file: {fileName}</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-slate-300">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2">{result.studyMode || 'Quick Summary'}</span>
            <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2">{result.difficulty || 'Medium'}</span>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-white">Summary</h3>
            <p className="mt-2 text-sm text-slate-400">A complete study-friendly overview built from the full uploaded document.</p>
            <p className="mt-3 leading-8 text-slate-300">{result.summary}</p>
          </section>
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-3 text-cyan-100">
            <Lightbulb className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Real-life Understanding</h3>
          </div>
          <p className="text-sm leading-7 text-slate-300">{result.realLifeUnderstanding}</p>

          {result.modeGuidance ? (
            <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 px-4 py-4">
              <div className="mb-2 flex items-center gap-2 text-cyan-100">
                <Gauge className="h-4 w-4" />
                <span className="text-sm font-medium text-white">Mode Guidance</span>
              </div>
              <p className="text-sm leading-7 text-slate-300">{result.modeGuidance}</p>
            </div>
          ) : null}

          {result.metadata ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-300">
                Chunks analyzed: {result.metadata.chunkCount}
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-300">
                Cleaned characters: {result.metadata.cleanedLength}
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard>
          <div className="mb-4 flex items-center gap-3 text-violet-100">
            <Brain className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-white">Key Concepts</h3>
          </div>
          <p className="mb-4 text-sm text-slate-400">Each concept includes a short explanation so the learner can revise the full document without missing major topics.</p>
          <div className="space-y-4">
            {result.keyConcepts.map((item) => (
              <div key={item.concept} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4">
                <h4 className="font-semibold text-white">{item.concept}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.explanation}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="mb-4 flex items-center gap-3 text-cyan-100">
              <Star className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-white">Important Points</h3>
            </div>
            <p className="mb-4 text-sm text-slate-400">Exam-focused points collected from the full document analysis.</p>
            <ul className="space-y-3 text-sm leading-7 text-slate-300">
              {result.importantPoints.map((point) => (
                <li key={point} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

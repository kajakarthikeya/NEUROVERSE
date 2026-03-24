import { Mic, Sparkles } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const studyModes = ['Quick Summary', 'Deep Learning', 'Exam Prep', 'Quick Revision'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];

export function TopicInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  title = 'Generate Any Topic',
  description = 'Type any concept, skill, or subject and let NeuroVerse build an AI-powered lesson instantly.',
  buttonLabel = 'Generate Learning',
  studyMode = 'Quick Summary',
  onStudyModeChange,
  difficulty = 'Medium',
  onDifficultyChange,
  onVoiceInput,
  voiceSupported = false,
  listening = false,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full border border-teal-300/20 bg-teal-400/10 px-4 py-2 text-sm text-teal-100 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
          <Sparkles className="mr-2 h-4 w-4 text-teal-300" />
          Adaptive AI Learning Generator
        </div>
        <h1 className="text-4xl font-bold text-white text-center pb-2">{title}</h1>
        <p className="mt-4 text-slate-400 text-center max-w-xl mx-auto text-sm leading-relaxed">{description}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 max-w-3xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <Input 
            value={value} 
            onChange={(event) => onChange(event.target.value)} 
            placeholder="Enter any topic to learn..." 
            className="flex-1 px-5 py-4 rounded-2xl bg-black/20 border border-white/10 text-white outline-none focus:border-cyan-400/50 focus:shadow-glow min-h-[60px] text-base font-medium leading-normal" 
          />
          <button
            type="button"
            onClick={onVoiceInput}
            disabled={!voiceSupported}
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white min-h-[60px] flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base leading-normal"
            title={voiceSupported ? 'Speak your topic' : 'Speech recognition is not available in this browser'}
          >
            <Mic className="h-5 w-5 text-slate-300" />
            {listening ? 'Listening...' : 'Voice Input'}
          </button>
          <Button type="submit" disabled={loading} className="px-8 py-4 !rounded-2xl min-h-[60px] w-full sm:w-auto shadow-[0_0_30px_rgba(56,189,248,0.4)] font-semibold text-base leading-normal">
            {loading ? 'Generating...' : buttonLabel}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative group">
            <label className="absolute left-5 top-3 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase pointer-events-none transition-colors group-focus-within:text-cyan-300">Study Mode</label>
            <select
              className="w-full h-auto min-h-[72px] pl-5 pr-10 pt-7 pb-3 rounded-2xl border border-white/10 bg-black/20 text-white outline-none focus:border-cyan-400/50 focus:shadow-glow appearance-none cursor-pointer transition focus:ring-1 focus:ring-cyan-400 text-base font-medium leading-normal"
              value={studyMode}
              onChange={(event) => onStudyModeChange?.(event.target.value)}
            >
              {studyModes.map((mode) => (
                <option key={mode} value={mode} className="bg-slate-900 text-white">
                  {mode}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div className="relative group">
            <label className="absolute left-5 top-3 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase pointer-events-none transition-colors group-focus-within:text-cyan-300">Difficulty</label>
            <select
              className="w-full h-auto min-h-[72px] pl-5 pr-10 pt-7 pb-3 rounded-2xl border border-white/10 bg-black/20 text-white outline-none focus:border-cyan-400/50 focus:shadow-glow appearance-none cursor-pointer transition focus:ring-1 focus:ring-cyan-400 text-base font-medium leading-normal"
              value={difficulty}
              onChange={(event) => onDifficultyChange?.(event.target.value)}
            >
              {difficultyLevels.map((level) => (
                <option key={level} value={level} className="bg-slate-900 text-white">
                  {level}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

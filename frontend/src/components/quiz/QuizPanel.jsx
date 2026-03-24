import { CheckCircle2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { generateQuiz } from '../../services/ai';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';

export function QuizPanel({ topic, onComplete }) {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleGenerateQuiz() {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await generateQuiz(topic);
      setQuiz(response.questions);
      setAnswers({});
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate a quiz right now.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmitQuiz() {
    const score = quiz.reduce((total, item, index) => total + (answers[index] === item.answer ? 1 : 0), 0);
    const xpEarned = score * 40;
    const outcome = {
      topic,
      score,
      xpEarned,
      completedAt: new Date().toISOString(),
    };

    setResult(outcome);
    onComplete(outcome);
  }

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Quiz Generator</h3>
          <p className="text-sm text-slate-400">Generate 3 smart MCQs for {topic}</p>
        </div>
        <NeonButton type="button" onClick={handleGenerateQuiz} className="text-sm">
          {loading ? 'Generating...' : 'Take Quiz'}
        </NeonButton>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      {quiz.length > 0 ? (
        <div className="mt-6 space-y-5">
          {quiz.map((item, index) => (
            <div key={item.question} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">
                {index + 1}. {item.question}
              </p>
              <div className="mt-4 grid gap-3">
                {item.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      answers[index] === option
                        ? 'border-cyan-300/50 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-violet-300/40'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {result ? (
                <div className="mt-4 rounded-2xl bg-white/5 p-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">Answer:</span> {item.answer}. {item.explanation}
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Every correct answer earns 40 XP.
            </div>
            <NeonButton type="button" onClick={handleSubmitQuiz}>
              Submit Quiz
            </NeonButton>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-slate-400">
          Generate a quiz to test what you learned in the immersive scene.
        </div>
      )}

      {result ? (
        <div className="mt-6 flex items-center gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <p className="text-sm text-emerald-100">
            Quiz complete: {result.score}/3 correct, {result.xpEarned} XP earned.
          </p>
        </div>
      ) : null}
    </GlassCard>
  );
}

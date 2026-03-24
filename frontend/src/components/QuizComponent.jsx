import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Sparkles, Target, TimerReset, ChevronRight, Check, MessageSquareText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { XPToastLayer } from './ui/XPToastLayer';

export function QuizComponent({ topic, questions = [], onComplete, heading = 'Quiz Section', subtitle = 'Test your understanding with AI-generated MCQs.' }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showAnswerFor, setShowAnswerFor] = useState({});
  const [result, setResult] = useState(null);
  const totalTime = Math.max(45, questions.length * 30);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [flash, setFlash] = useState(false);
  const [xpToasts, setXpToasts] = useState([]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowAnswerFor({});
    setResult(null);
    setTimeLeft(Math.max(45, questions.length * 30));
    setXpToasts([]);
  }, [topic, questions]);

  useEffect(() => {
    if (!questions.length || result || timeLeft <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFlash(true);
          setTimeout(() => setFlash(false), 800);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, result, timeLeft]);

  const timerPercent = useMemo(() => {
    return Math.round((timeLeft / totalTime) * 100);
  }, [totalTime, timeLeft]);

  if (!questions.length) return null;

  function handleSubmitQuiz() {
    const incorrectAnswers = [];
    let score = 0;
    
    questions.forEach((item, index) => {
      const isCorrect = answers[index] === item.answer;
      if (isCorrect) {
        score += 1;
      } else {
        incorrectAnswers.push({
          question: item.question,
          selected: answers[index],
          correctAnswer: item.answer,
          concept: item.concept || item.focusArea || item.topic || topic,
          explanation: item.explanation,
        });
      }
    });

    const xpEarned = score * 40;
    const outcome = {
      topic,
      score,
      xpEarned,
      totalQuestions: questions.length,
      incorrectAnswers,
      weakTopics: incorrectAnswers.map((item) => ({ label: item.concept, question: item.question, topic })),
      completedAt: new Date().toISOString(),
    };

    setResult(outcome);
    onComplete?.(outcome);
  }

  function handleSelectOption(option) {
    if (showAnswerFor[currentQuestionIndex] || result) return;
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
  }

  function handleNextAction() {
    if (!showAnswerFor[currentQuestionIndex]) {
      // Lock in answer, reveal correctness
      setShowAnswerFor((prev) => ({ ...prev, [currentQuestionIndex]: true }));
      
      const isCorrect = answers[currentQuestionIndex] === questions[currentQuestionIndex].answer;
      if (isCorrect) {
        // Trigger +40 XP floating toast
        const newToast = { id: Date.now(), amount: 40, x: window.innerWidth * 0.4 + (Math.random() * 100), y: window.innerHeight * 0.5 };
        setXpToasts((prev) => [...prev, newToast]);
        // Remove toast after 2s
        setTimeout(() => {
          setXpToasts((prev) => prev.filter(t => t.id !== newToast.id));
        }, 2000);
      }
    } else {
      // Move to next question or submit
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmitQuiz();
      }
    }
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers[currentQuestionIndex];
  const isRevealed = showAnswerFor[currentQuestionIndex] || result;

  return (
    <>
      <XPToastLayer items={xpToasts} />
      
      <motion.div animate={flash ? { backgroundColor: ['rgba(11,15,26,0)', 'rgba(239,68,68,0.4)', 'rgba(11,15,26,0)'] } : {}} transition={{ duration: 0.8 }}>
        <Card className={`overflow-hidden relative ${flash ? 'border-rose-500' : ''}`} hover={false}>
          {/* Header & Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{heading}</h3>
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 font-medium">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className={`rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${timeLeft < 10 ? 'border-rose-500/50 bg-rose-500/20 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                <TimerReset className="mr-2 inline h-4 w-4" />
                {timeLeft}s
              </div>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/80 mb-8 border border-white/5">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${timerPercent}%` }}
              className={`h-full rounded-full transition-colors duration-300 ${timerPercent > 30 ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}
            />
          </div>

          {/* Quiz Content Container or Results */}
          {!result ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 md:p-8 backdrop-blur-md shadow-glass">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <h4 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h4>
                    {currentQuestion.concept && (
                      <span className="shrink-0 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs tracking-wide text-purple-200">
                        {currentQuestion.concept}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = isRevealed && option === currentQuestion.answer;
                      const isMistake = isRevealed && isSelected && option !== currentQuestion.answer;

                      let btnClass = "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20";
                      
                      if (isCorrect) {
                        btnClass = "border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400";
                      } else if (isMistake) {
                        btnClass = "border-rose-400 bg-rose-500/20 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-400";
                      } else if (isSelected && !isRevealed) {
                        btnClass = "border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400";
                      } else if (isRevealed) {
                        btnClass = "border-white/5 bg-black/40 text-slate-500 opacity-60"; // dim unselected wrong answers
                      }

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelectOption(option)}
                          disabled={isRevealed}
                          className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-[15px] font-medium transition-all duration-300 outline-none ${btnClass}`}
                        >
                          <span>{option}</span>
                          {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                          {isMistake && <AlertTriangle className="h-5 w-5 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        className="overflow-hidden"
                      >
                        <div className={`rounded-2xl border p-5 ${selectedOption === currentQuestion.answer ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-rose-500/20 bg-rose-500/10'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-white">
                              {selectedOption === currentQuestion.answer ? 'Correct!' : `Incorrect. The answer is ${currentQuestion.answer}.`}
                            </p>
                            {selectedOption !== currentQuestion.answer && (
                              <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('neuroverse:explain', { detail: { prompt: `Can you explain why the correct answer to "${currentQuestion.question}" is "${currentQuestion.answer}"? I originally guessed "${selectedOption}".` } }))}
                                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:text-cyan-100 transition-colors bg-cyan-900/30 px-3 py-1.5 rounded-full border border-cyan-500/20"
                              >
                                <MessageSquareText className="h-4 w-4" /> Explain
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-slate-400 font-medium">
                    {40} XP per correct answer
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleNextAction} 
                    disabled={!selectedOption}
                    className="px-8 py-3.5 min-w-[140px]"
                  >
                    {!isRevealed ? (
                      <span className="flex items-center gap-2">Final Answer <Check className="h-4 w-4" /></span>
                    ) : currentQuestionIndex < questions.length - 1 ? (
                      <span className="flex items-center gap-2">Next Question <ChevronRight className="h-4 w-4" /></span>
                    ) : (
                      'Finish Quiz'
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-10 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h3>
                <p className="text-lg text-emerald-100/80">
                  You scored {result.score} out of {result.totalQuestions} and earned <strong className="text-emerald-300">{result.xpEarned} XP</strong>.
                </p>
              </div>

              {result.incorrectAnswers.length > 0 ? (
                <div className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-6">
                  <div className="mb-4 flex items-center gap-2 font-medium text-amber-200 tracking-wide uppercase text-sm">
                    <Target className="h-4 w-4" />
                    Focus areas detected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.weakTopics.map((item) => (
                      <span key={`${item.label}-${item.question}`} className="rounded-full border border-amber-300/20 bg-black/40 px-4 py-2 text-sm text-amber-100">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6 text-cyan-50 text-center">
                  <Sparkles className="h-5 w-5 text-cyan-300" />
                  No weak areas detected in this round. You have mastered this module!
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </>
  );
}

import { motion } from 'framer-motion';
import { BookmarkPlus, Download, Expand, RotateCcw, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { AIChatPanel } from '../components/chat/AIChatPanel';
import { LearningFromDoc } from '../components/LearningFromDoc';
import { LearningResult } from '../components/LearningResult';
import { TopicInput } from '../components/TopicInput';
import { QuizComponent } from '../components/QuizComponent';
import { Sidebar } from '../components/layout/Sidebar';
import { GlassCard } from '../components/ui/GlassCard';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useUserProgress } from '../hooks/useUserProgress';
import { KnowledgeScene } from '../scenes/KnowledgeScene';
import { extractTextFromFile } from '../services/TextExtractor';
import { generateDocumentLearning, generateLearning } from '../services/ai';

function buildRevisionCards(payload) {
  if (!payload) {
    return [];
  }

  if (payload.keyConcepts?.length) {
    return payload.keyConcepts.map((item) => ({
      title: item.concept,
      body: item.explanation,
    }));
  }

  return (payload.keyPoints || []).map((point, index) => ({
    title: `Memory Hook ${index + 1}`,
    body: point,
  }));
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function buildNotesText({ topic, studyMode, difficulty, learningResult, documentResult, quizQuestions }) {
  const active = documentResult || learningResult;
  if (!active) {
    return '';
  }

  const lines = [
    `NeuroVerse Notes`,
    `Topic: ${active.title || topic}`,
    `Study Mode: ${studyMode}`,
    `Difficulty: ${difficulty}`,
    '',
  ];

  if (learningResult) {
    lines.push('Explanation', learningResult.explanation, '');
    lines.push('Key Points');
    learningResult.keyPoints.forEach((point, index) => lines.push(`${index + 1}. ${point}`));
    lines.push('', 'Real-life Example', learningResult.realLifeExample, '');
  }

  if (documentResult) {
    lines.push('Summary', documentResult.summary, '');
    lines.push('Key Concepts');
    documentResult.keyConcepts.forEach((item, index) => lines.push(`${index + 1}. ${item.concept}: ${item.explanation}`));
    lines.push('', 'Important Points');
    documentResult.importantPoints.forEach((point, index) => lines.push(`${index + 1}. ${point}`));
    lines.push('', 'Real-life Understanding', documentResult.realLifeUnderstanding, '');
  }

  lines.push('Quiz');
  quizQuestions.forEach((question, index) => {
    lines.push(`${index + 1}. ${question.question}`);
    question.options.forEach((option) => lines.push(`- ${option}`));
    lines.push(`Answer: ${question.answer}`);
    lines.push(`Explanation: ${question.explanation}`);
    lines.push('');
  });

  return lines.join('\n');
}

function RevisionDeck({ cards, topic }) {
  if (!cards.length) {
    return null;
  }

  return (
    <GlassCard hover={false}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-white">Revise in 60 Seconds</h3>
          <p className="mt-2 text-sm text-slate-400">Flashcard-style memory hooks for {topic}.</p>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
          Quick Revision
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={`${card.title}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="rounded-3xl border border-white/10 bg-slate-950/45 p-5"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Card {index + 1}</div>
            <h4 className="mt-3 text-lg font-semibold text-white">{card.title}</h4>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

export function LearningScenePage() {
  const { user } = useAuth();
  const { progress, applyQuizResult, saveTopic } = useUserProgress(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [studyMode, setStudyMode] = useState(searchParams.get('studyMode') || 'Quick Summary');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'Medium');
  const [immersive, setImmersive] = useState(false);
  const [learningResult, setLearningResult] = useState(null);
  const [documentResult, setDocumentResult] = useState(null);
  const [documentFileName, setDocumentFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [quizInsight, setQuizInsight] = useState('');
  const [revisionVisible, setRevisionVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const voiceSupported = Boolean(getSpeechRecognition());

  useEffect(() => {
    const paramTopic = searchParams.get('topic') || '';
    setTopic(paramTopic);
    setStudyMode(searchParams.get('studyMode') || 'Quick Summary');
    setDifficulty(searchParams.get('difficulty') || 'Medium');
  }, [searchParams]);

  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      return undefined;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setTopic(transcript);
      }
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    const paramTopic = searchParams.get('topic');
    if (paramTopic) {
      void handleGenerateTopic(paramTopic, {
        studyMode: searchParams.get('studyMode') || 'Quick Summary',
        difficulty: searchParams.get('difficulty') || 'Medium',
      });
    }
  }, []);

  const activeTopic = documentResult?.title || learningResult?.title || topic;
  const activePayload = documentResult || learningResult;
  const revisionCards = useMemo(() => buildRevisionCards(activePayload), [activePayload]);
  const quizQuestions = documentResult?.quiz || learningResult?.quiz || [];

  async function handleExperienceMode() {
    setImmersive((value) => !value);
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen && document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }

  async function handleGenerateTopic(nextTopicOverride, optionsOverride = {}) {
    const nextTopic = (nextTopicOverride || topic).trim();
    const nextStudyMode = optionsOverride.studyMode || studyMode;
    const nextDifficulty = optionsOverride.difficulty || difficulty;

    if (!nextTopic) {
      setError('Enter a topic first to generate learning content.');
      return;
    }

    setLoading(true);
    setError('');
    setSavedMessage('');
    setQuizInsight('');
    setRevisionVisible(nextStudyMode === 'Quick Revision');
    setDocumentResult(null);
    setDocumentFileName('');

    try {
      const response = await generateLearning(nextTopic, { studyMode: nextStudyMode, difficulty: nextDifficulty });
      setLearningResult(response);
      setSearchParams({ topic: nextTopic, studyMode: nextStudyMode, difficulty: nextDifficulty });
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate learning content right now.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(file) {
    setDocumentLoading(true);
    setError('');
    setSavedMessage('');
    setQuizInsight('');
    setLearningResult(null);

    try {
      const extractedText = await extractTextFromFile(file);
      if (!extractedText.trim()) {
        throw new Error('No readable text was found in that file.');
      }

      const response = await generateDocumentLearning(file.name, extractedText, { studyMode, difficulty });
      setDocumentFileName(file.name);
      setDocumentResult(response);
      setRevisionVisible(studyMode === 'Quick Revision');
      setSearchParams({ mode: 'document', studyMode, difficulty });
    } catch (requestError) {
      setError(requestError.message || 'Unable to process that document right now.');
    } finally {
      setDocumentLoading(false);
    }
  }

  function handleGenerateSubmit(event) {
    event.preventDefault();
    void handleGenerateTopic();
  }

  function handleQuizComplete(result, sourceType) {
    applyQuizResult({ ...result, sourceType, studyMode });
    if (result.weakTopics?.length) {
      setQuizInsight(`You should focus more on ${result.weakTopics.map((item) => item.label).slice(0, 2).join(' and ')}.`);
    } else {
      setQuizInsight('Strong work. You cleared this quiz without leaving weak areas behind.');
    }
  }

  async function handleSaveTopic() {
    if (!activePayload) {
      return;
    }

    await saveTopic({
      title: activeTopic,
      studyMode,
      difficulty,
      sourceType: documentResult ? 'document' : 'topic',
    });
    setSavedMessage(`${activeTopic} has been added to your saved topics.`);
  }

  async function handleDownloadNotes() {
    const notesText = buildNotesText({ topic: activeTopic, studyMode, difficulty, learningResult, documentResult, quizQuestions });
    if (!notesText) {
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const lines = pdf.splitTextToSize(notesText, 520);
      let y = 48;

      lines.forEach((line) => {
        if (y > 780) {
          pdf.addPage();
          y = 48;
        }
        pdf.text(line, 40, y);
        y += 18;
      });

      pdf.save(`${activeTopic || 'neuroverse-notes'}.pdf`);
    } catch (downloadError) {
      setError(downloadError.message || 'Unable to download notes right now.');
    }
  }

  function handleVoiceInput() {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in this browser.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    setError('');
    setListening(true);
    recognitionRef.current.start();
  }

  const weakSuggestions = progress?.weakTopics?.slice(0, 3) || [];

  return (
    <main className="page-shell min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8 bg-[#0B0F1A]">
      <div className="relative z-10 mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[1fr_400px] items-start">
        {/* LEFT PANE: 3D Content & Interactive Learning */}
        <div className="space-y-6 flex flex-col min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Learning Studio</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">Adaptive AI learning workspace</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to="/dashboard" variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10">
                Back to Dashboard
              </Button>
              <Button type="button" onClick={handleExperienceMode} className="bg-white/5 border-white/10 hover:bg-white/10">
                <Expand className="mr-2 h-4 w-4" />
                {immersive ? 'Exit Split Mode' : 'Enter Immersive View'}
              </Button>
            </div>
          </div>

          <GlassCard className="overflow-hidden p-0 flex flex-col" hover={false}>
            {/* 3D Scene Area */}
            <div className="relative h-[260px] w-full shrink-0 flex items-center justify-center bg-gradient-to-b from-transparent to-slate-950/40">
              <KnowledgeScene topic={activeTopic} />
            </div>
            
            {/* Input Controls Area */}
            <div className="relative w-full border-t border-white/5 bg-black/40 p-6 sm:p-10 flex flex-col items-center justify-center">
              <TopicInput
                value={topic}
                onChange={setTopic}
                onSubmit={handleGenerateSubmit}
                loading={loading}
                title="Generate any lesson with the right study mode"
                description="Speak or type a topic, choose how you want to study it, and let NeuroVerse tailor the lesson, quiz, and revision flow."
                studyMode={studyMode}
                onStudyModeChange={setStudyMode}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                onVoiceInput={handleVoiceInput}
                voiceSupported={voiceSupported}
                listening={listening}
              />
            </div>
          </GlassCard>

          <FileUpload onUpload={handleDocumentUpload} loading={documentLoading} />

          {loading || documentLoading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 shadow-glass backdrop-blur-xl">
              <Loader
                label="Generating learning experience..."
                sublabel={documentLoading ? 'Cleaning text, splitting chunks, analyzing all topics, and building your quiz.' : 'Designing a lesson, quiz, and revision path for your topic.'}
                size="lg"
              />
            </div>
          ) : null}

          {error ? <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">{error}</div> : null}
          {savedMessage ? <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">{savedMessage}</div> : null}
          {quizInsight ? <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">{quizInsight}</div> : null}

          {activePayload ? (
            <GlassCard hover={false}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Smart Actions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Turn this lesson into memory and momentum</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={() => setRevisionVisible((value) => !value)} className="bg-white/5 border-white/10 hover:bg-white/10">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Revise in 60 seconds
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleSaveTopic} className="bg-white/5 border-white/10 hover:bg-white/10">
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Save Topic
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleDownloadNotes} className="bg-white/5 border-white/10 hover:bg-white/10">
                    <Download className="mr-2 h-4 w-4" />
                    Download Notes
                  </Button>
                </div>
              </div>
            </GlassCard>
          ) : null}

          {learningResult ? <LearningResult result={learningResult} /> : null}
          {documentResult ? <LearningFromDoc result={documentResult} fileName={documentFileName} /> : null}
          {revisionVisible ? <RevisionDeck cards={revisionCards} topic={activeTopic} /> : null}

          <div className="w-full">
            <QuizComponent
              topic={documentResult?.title || learningResult?.title || topic}
              questions={quizQuestions}
              heading={documentResult ? 'Document Quiz' : 'Quiz Section'}
              subtitle={documentResult ? 'Test what you learned from the full document analysis with 5 MCQs.' : 'Test your understanding with AI-generated MCQs tailored to your mode and difficulty.'}
              onComplete={(result) => handleQuizComplete(result, documentResult ? 'document' : 'topic')}
            />
          </div>
        </div>

        {/* RIGHT PANE: AI Chat & Controls */}
        <div className="space-y-6 sticky top-6">
          <AIChatPanel topic={activeTopic} />
          
          <GlassCard hover={false}>
                <h3 className="text-lg font-semibold text-white">Progress Snapshot</h3>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">XP: {progress?.xp || 0}</div>
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">Level: {progress?.level || 1}</div>
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">Completed topics: {progress?.completedTopics.length || 0}</div>
                  <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">Saved topics: {progress?.savedTopics.length || 0}</div>
                </div>
              </GlassCard>

              <GlassCard hover={false}>
                <div className="mb-4 flex items-center gap-3 text-amber-100">
                  <WandSparkles className="h-5 w-5" />
                  <h3 className="text-lg font-semibold text-white">Focus Suggestions</h3>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  {weakSuggestions.length ? (
                    weakSuggestions.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="mt-1 text-slate-400">{item.suggestion}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Finish a quiz to let NeuroVerse detect weak areas and recommend what to revise next.</p>
                  )}
                </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

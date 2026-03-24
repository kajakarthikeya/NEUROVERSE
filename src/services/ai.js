const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '');
const isProduction = Boolean(import.meta.env.PROD);

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','than','that','this','these','those','is','are','was','were','be','been','being','of','to','in','on','for','with','as','by','at','from','it','its','into','about','over','after','before','between','through','during','without','within','also','can','could','should','would','will','may','might','do','does','did','done','have','has','had','having','we','you','they','he','she','them','their','our','your','his','her','not','no','yes','such','more','most','some','any','all','each','every','many','much','other','another','because','while','where','when','what','which','who','whom'
]);

function buildUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function getDeploymentConfigError() {
  if (!isProduction || typeof window === 'undefined') {
    return '';
  }

  if (!API_BASE_URL) {
    return '';
  }

  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    return 'NeuroVerse frontend is pointing to localhost in production. Remove VITE_API_BASE_URL for same-project Vercel APIs, or set it to your live backend URL and redeploy.';
  }

  return '';
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 30);
}

function extractKeywords(text, limit = 8) {
  const counts = new Map();
  const words = text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || [];

  words.forEach((word) => {
    if (STOP_WORDS.has(word)) return;
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word.replace(/-/g, ' '));
}

function findSentenceForConcept(text, concept) {
  return splitSentences(text).find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) || '';
}

function titleCase(text = '') {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildModeGuidance(studyMode, difficulty) {
  const modeLabel = studyMode || 'Quick Summary';
  const difficultyLabel = difficulty || 'Medium';
  const guidanceMap = {
    'Quick Summary': 'Focus on the core meaning first, then remember the top ideas and one strong example.',
    'Deep Learning': 'Move slowly through the explanation, connect each idea to the next one, and ask why each concept matters.',
    'Exam Prep': 'Concentrate on definitions, high-yield points, and likely quiz traps that can appear in tests.',
    'Quick Revision': 'Skim the memory hooks, repeat the concepts aloud, and use the flashcards to refresh fast.',
  };

  return `${modeLabel} mode is active at ${difficultyLabel} difficulty. ${guidanceMap[modeLabel] || guidanceMap['Quick Summary']}`;
}

function createFallbackQuiz(topic, difficulty = 'Medium') {
  return [
    {
      question: `What is the best first step when learning ${topic}?`,
      options: ['Understand the main idea in simple words', 'Memorize without context', 'Ignore examples', 'Skip revision'],
      answer: 'Understand the main idea in simple words',
      explanation: 'Strong understanding begins with a clear simple definition.',
      concept: `${topic} basics`,
    },
    {
      question: `Why do examples help while studying ${topic}?`,
      options: ['They make the idea easier to imagine', 'They remove the need to practice', 'They are only useful in hard mode', 'They replace understanding'],
      answer: 'They make the idea easier to imagine',
      explanation: 'Examples build memory and connect the topic to something familiar.',
      concept: `${topic} application`,
    },
    {
      question: `What usually shows real understanding of ${topic}?`,
      options: ['Explaining it in your own words', 'Reading it once only', 'Skipping key points', 'Avoiding questions'],
      answer: 'Explaining it in your own words',
      explanation: 'If you can restate an idea clearly, you have started understanding it.',
      concept: `${topic} understanding`,
    },
  ].map((item) => ({ ...item, difficulty }));
}

function createFallbackLearning(topic, options = {}) {
  const { studyMode = 'Quick Summary', difficulty = 'Medium' } = options;
  const examTone = studyMode === 'Exam Prep' ? 'For exams, pay attention to definitions, comparisons, and frequently tested points.' : '';
  const revisionTone = studyMode === 'Quick Revision' ? 'This version is intentionally compact so you can refresh the topic quickly.' : '';
  const deepTone = studyMode === 'Deep Learning' ? 'Go one layer deeper by asking how the topic works, where it is used, and how the parts connect.' : '';

  return {
    title: topic,
    explanation: `${topic} becomes easier for a new learner when they first understand what it is, why it matters, and how to picture it in simple words. ${examTone} ${revisionTone} ${deepTone}`.trim(),
    keyPoints: [
      `Start with the simple meaning of ${topic} before moving into details.`,
      `Connect ${topic} to one practical example so the idea stays in memory.`,
      `Revise ${topic} by repeating the core points aloud in your own words.`,
    ],
    realLifeExample: `${topic} often appears in real learning, work, daily systems, technology, nature, or decision-making, which is why examples help it stick better.`,
    quiz: createFallbackQuiz(topic, difficulty),
    studyMode,
    difficulty,
    modeGuidance: buildModeGuidance(studyMode, difficulty),
    source: 'client-fallback',
  };
}

function createFallbackDocumentLearning(fileName, content, options = {}) {
  const { studyMode = 'Quick Summary', difficulty = 'Medium' } = options;
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const concepts = extractKeywords(content, 6);
  const keyConcepts = concepts.map((concept) => ({
    concept: titleCase(concept),
    explanation: findSentenceForConcept(content, concept) || `${titleCase(concept)} appears as one of the repeated ideas in the document.`,
  }));
  const importantPoints = splitSentences(content).slice(0, 8);
  const summary = importantPoints.slice(0, 4).join(' ');
  const realLifeUnderstanding = splitSentences(content).find((sentence) => /(example|application|used|practical|real life)/i.test(sentence)) || 'Connect the concepts in this document to class discussions, practical examples, and revision notes for better recall.';

  return {
    title: keyConcepts[0]?.concept ? `${keyConcepts[0].concept} Revision Guide` : baseName,
    summary: summary || `${baseName} contains study material extracted from your file.`,
    keyConcepts: keyConcepts.length ? keyConcepts : [{ concept: baseName, explanation: `${baseName} is the central topic found in the uploaded document.` }],
    importantPoints: importantPoints.length ? importantPoints : [`${baseName} contains connected study points extracted from your file.`],
    realLifeUnderstanding,
    quiz: (keyConcepts.length ? keyConcepts : [{ concept: baseName }]).slice(0, 5).map((item, index) => ({
      question: 'Which concept is directly covered in this document?',
      options: [item.concept, 'An unrelated idea', 'A missing topic', index % 2 === 0 ? 'A decorative label' : 'A random example'],
      answer: item.concept,
      explanation: `${item.concept} is one of the concepts identified from the uploaded content.`,
      concept: item.concept,
      difficulty,
    })),
    metadata: {
      chunkCount: 1,
      cleanedLength: content.length,
    },
    studyMode,
    difficulty,
    modeGuidance: buildModeGuidance(studyMode, difficulty),
    source: 'client-fallback',
  };
}

async function postJson(path, body, fallbackFactory) {
  const deploymentConfigError = getDeploymentConfigError();
  if (deploymentConfigError) {
    throw new Error(deploymentConfigError);
  }

  try {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Request failed.');
    }

    return response.json();
  } catch (error) {
    if (fallbackFactory) {
      console.warn(`Falling back locally for ${path}`, error);
      return fallbackFactory();
    }

    if (error instanceof TypeError) {
      throw new Error('Could not reach the NeuroVerse API. Start the full app with npm run dev.');
    }

    throw error;
  }
}

export async function askAssistant(prompt, context) {
  return postJson('/api/assistant', { prompt, context }, () => ({
    reply: `NeuroVerse offline mode: here is a quick guide to ${context?.topic || 'this topic'}. ${prompt} is best answered by starting with the core idea, then linking it to an example. What part would you like to simplify next?`,
    source: 'client-fallback',
  }));
}

export async function generateLearning(topic, options = {}) {
  return postJson('/api/learn', { topic, ...options }, () => createFallbackLearning(topic, options));
}

export async function generateDocumentLearning(fileName, content, options = {}) {
  return postJson('/api/learn-from-document', { fileName, content, ...options }, () => createFallbackDocumentLearning(fileName, content, options));
}

export async function generateQuiz(topic, options = {}) {
  return postJson('/api/quiz', { topic, ...options }, () => ({
    questions: createFallbackLearning(topic, options).quiz,
    source: 'client-fallback',
  }));
}


import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: '8mb' }));

const openAIModel = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const fallbackGeminiModel = 'gemini-2.5-flash';
const hasGemini = Boolean(process.env.GEMINI_API_KEY);
const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
const openai = hasOpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const activeProvider = hasGemini ? 'gemini' : hasOpenAI ? 'openai' : 'fallback';
let lastProviderError = null;
let lastResolvedGeminiModel = hasGemini ? geminiModel : null;

function recordProviderError(provider, error) {
  lastProviderError = {
    provider,
    message: error instanceof Error ? error.message : String(error),
    at: new Date().toISOString(),
  };
  console.error('[' + provider + '] provider request failed', error);
}

function getProviderDebugMessage() {
  if (!hasGemini && !hasOpenAI) {
    return 'No GEMINI_API_KEY or OPENAI_API_KEY is available in the deployed server environment.';
  }

  if (lastProviderError?.message) {
    return `${lastProviderError.provider || 'provider'} error: ${lastProviderError.message}`;
  }

  return `Provider selected: ${activeProvider}. The request still fell back before a live response was returned.`;
}
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','than','that','this','these','those','is','are','was','were','be','been','being','of','to','in','on','for','with','as','by','at','from','it','its','into','about','over','after','before','between','through','during','without','within','also','can','could','should','would','will','may','might','do','does','did','done','have','has','had','having','we','you','they','he','she','them','their','our','your','his','her','not','no','yes','such','more','most','some','any','all','each','every','many','much','other','another','because','while','where','when','what','which','who','whom'
]);

const topicLearningSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    explanation: { type: 'string' },
    keyPoints: {
      type: 'array',
      minItems: 3,
      items: { type: 'string' },
    },
    realLifeExample: { type: 'string' },
    modeGuidance: { type: 'string' },
    quiz: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          answer: { type: 'string' },
          explanation: { type: 'string' },
          concept: { type: 'string' },
        },
        required: ['question', 'options', 'answer', 'explanation', 'concept'],
      },
    },
  },
  required: ['title', 'explanation', 'keyPoints', 'realLifeExample', 'modeGuidance', 'quiz'],
};

const chunkAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    chunkSummary: { type: 'string' },
    keyConcepts: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          concept: { type: 'string' },
          definition: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['concept', 'definition', 'explanation'],
      },
    },
    importantPoints: {
      type: 'array',
      minItems: 1,
      items: { type: 'string' },
    },
  },
  required: ['chunkSummary', 'keyConcepts', 'importantPoints'],
};

const finalDocumentSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    keyConcepts: {
      type: 'array',
      minItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          concept: { type: 'string' },
          explanation: { type: 'string' },
        },
        required: ['concept', 'explanation'],
      },
    },
    importantPoints: {
      type: 'array',
      minItems: 4,
      items: { type: 'string' },
    },
    realLifeUnderstanding: { type: 'string' },
    modeGuidance: { type: 'string' },
  },
  required: ['title', 'summary', 'keyConcepts', 'importantPoints', 'realLifeUnderstanding', 'modeGuidance'],
};

const quizSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    quiz: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          answer: { type: 'string' },
          explanation: { type: 'string' },
          concept: { type: 'string' },
        },
        required: ['question', 'options', 'answer', 'explanation', 'concept'],
      },
    },
  },
  required: ['quiz'],
};

function extractTextFromGemini(payload) {
  return payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
}

function safeJsonParse(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function cleanText(text = '') {
  return text
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 30);
}

function chunkText(text, minSize = 800, maxSize = 1200) {
  const cleaned = cleanText(text);
  const sentences = splitSentences(cleaned);

  if (!sentences.length) {
    return cleaned ? [cleaned] : [];
  }

  const chunks = [];
  let current = '';

  sentences.forEach((sentence) => {
    const next = current ? `${current} ${sentence}` : sentence;

    if (next.length <= maxSize) {
      current = next;
      return;
    }

    if (current.length >= minSize) {
      chunks.push(current.trim());
      current = sentence;
      return;
    }

    if (sentence.length > maxSize) {
      const words = sentence.split(' ');
      let longChunk = current;

      words.forEach((word) => {
        const candidate = longChunk ? `${longChunk} ${word}` : word;
        if (candidate.length > maxSize) {
          if (longChunk.trim()) chunks.push(longChunk.trim());
          longChunk = word;
        } else {
          longChunk = candidate;
        }
      });

      current = longChunk;
      return;
    }

    chunks.push(next.trim());
    current = '';
  });

  if (current.trim()) {
    if (chunks.length && current.length < minSize) {
      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${current}`.trim();
    } else {
      chunks.push(current.trim());
    }
  }

  return chunks.filter(Boolean);
}

function extractKeywords(text, limit = 10) {
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
  const lowerConcept = concept.toLowerCase();
  return splitSentences(text).find((sentence) => sentence.toLowerCase().includes(lowerConcept)) || '';
}

function titleCase(text = '') {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildModeGuidance(studyMode = 'Quick Summary', difficulty = 'Medium') {
  const guidanceMap = {
    'Quick Summary': 'Start with the overview, remember the top ideas, and attach one strong example to each big concept.',
    'Deep Learning': 'Use the explanation to understand relationships, hidden logic, and why each idea works the way it does.',
    'Exam Prep': 'Prioritize definitions, concept differences, and high-yield points that are most likely to appear in a test.',
    'Quick Revision': 'Move fast through memory hooks and flashcards, then retake a quiz to lock in recall.',
  };

  return `${studyMode} mode at ${difficulty} difficulty. ${guidanceMap[studyMode] || guidanceMap['Quick Summary']}`;
}

function buildDeterministicChunkAnalysis(chunkTextValue) {
  const concepts = extractKeywords(chunkTextValue, 5);
  const importantSentences = splitSentences(chunkTextValue).slice(0, 4);

  return {
    chunkSummary: importantSentences[0] || chunkTextValue.slice(0, 180),
    keyConcepts: concepts.map((concept) => {
      const sentence = findSentenceForConcept(chunkTextValue, concept);
      return {
        concept: titleCase(concept),
        definition: sentence || `${titleCase(concept)} is one of the important ideas mentioned in this chunk.`,
        explanation: sentence || `This chunk uses ${concept} as part of the topic being explained.`,
      };
    }),
    importantPoints: importantSentences,
  };
}

function buildDeterministicMergedDocument(fileName, cleanedText, chunkAnalyses, studyMode, difficulty) {
  const conceptMap = new Map();
  const importantPoints = [];

  chunkAnalyses.forEach((analysis) => {
    analysis.keyConcepts.forEach((item) => {
      const key = item.concept.toLowerCase();
      if (!conceptMap.has(key)) {
        conceptMap.set(key, {
          concept: item.concept,
          explanation: `${item.definition} ${item.explanation}`.trim(),
        });
      }
    });

    analysis.importantPoints.forEach((point) => {
      if (!importantPoints.includes(point)) {
        importantPoints.push(point);
      }
    });
  });

  const keyConcepts = [...conceptMap.values()].slice(0, 10);
  const title = keyConcepts[0]?.concept ? `${keyConcepts[0].concept} Revision Guide` : fileName.replace(/\.[^.]+$/, '');
  const summary = splitSentences(cleanedText).slice(0, 4).join(' ');
  const realLifeUnderstanding = splitSentences(cleanedText).find((sentence) => /(example|application|used|real life|practical)/i.test(sentence)) || 'Connect these concepts to real examples from class notes, lab work, case studies, or daily-life situations to retain them better.';

  return {
    title,
    summary: summary || `${title} is the main study theme found across the uploaded document.`,
    keyConcepts,
    importantPoints: importantPoints.slice(0, 10),
    realLifeUnderstanding,
    modeGuidance: buildModeGuidance(studyMode, difficulty),
  };
}

function buildDeterministicQuiz(finalOutput, difficulty = 'Medium') {
  const concepts = finalOutput.keyConcepts.slice(0, 5);
  const distractors = ['An unrelated idea', 'A detail not discussed', 'A missing topic', 'A revision method'];

  return {
    quiz: concepts.map((item, index) => ({
      question: 'Which concept is directly covered in this study material?',
      options: [item.concept, distractors[index % distractors.length], distractors[(index + 1) % distractors.length], distractors[(index + 2) % distractors.length]],
      answer: item.concept,
      explanation: `${item.concept} is explicitly identified as one of the important concepts in the document.`,
      concept: item.concept,
      difficulty,
    })),
  };
}

function getFallbackLearning(topic, studyMode = 'Quick Summary', difficulty = 'Medium') {
  const modeGuidance = buildModeGuidance(studyMode, difficulty);
  return {
    title: topic,
    explanation: `${topic} becomes easier for a new learner when they first understand what it is, why it matters, and how to picture it in simple words. ${modeGuidance}`,
    keyPoints: [
      `Start with the simple meaning of ${topic} before moving into details.`,
      `Use one strong example so ${topic} feels practical instead of abstract.`,
      `Repeat the core points of ${topic} in your own words for better memory.`,
    ],
    realLifeExample: `${topic} often appears in learning, work, systems, technology, nature, or daily decisions, so connecting it to a real example improves recall.`,
    modeGuidance,
    quiz: [
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
    ],
    studyMode,
    difficulty,
  };
}

async function generateWithGemini(prompt) {
  const modelCandidates = [...new Set([geminiModel, fallbackGeminiModel].filter(Boolean))];
  let lastError = null;

  for (const modelName of modelCandidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: 'text/plain',
          },
        }),
      },
    );

    if (response.ok) {
      lastResolvedGeminiModel = modelName;
      return response.json();
    }

    const errorText = await response.text();
    lastError = new Error(errorText || `Gemini request failed for ${modelName}.`);

    if (response.status !== 404) {
      throw lastError;
    }
  }

  throw lastError || new Error('Gemini request failed.');
}

async function generateJsonGemini(prompt) {
  const payload = await generateWithGemini(prompt);
  return safeJsonParse(extractTextFromGemini(payload));
}

async function generateJsonOpenAI({ system, user, schemaName, schema }) {
  const response = await openai.responses.create({
    model: openAIModel,
    input: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        schema,
      },
    },
  });

  return JSON.parse(response.output_text);
}

async function analyzeChunkWithAI(chunkTextValue, chunkIndex, totalChunks) {
  const prompt = [
    'You are an expert teacher.',
    'Analyze the following study material carefully.',
    'Extract:',
    '1. All key concepts',
    '2. Important definitions',
    '3. Key points (exam-focused)',
    '4. Short explanation of each concept',
    'Do NOT skip any topic.',
    'Return strict JSON only with this shape:',
    '{"chunkSummary":"","keyConcepts":[{"concept":"","definition":"","explanation":""}],"importantPoints":["",""]}',
    `Chunk ${chunkIndex + 1} of ${totalChunks}`,
    `Content:\n${chunkTextValue}`,
  ].join('\n');

  if (hasGemini) {
    return generateJsonGemini(prompt);
  }

  if (openai) {
    return generateJsonOpenAI({
      system: 'You are an expert teacher. Extract every important concept from the provided chunk. Do not skip topics. Return JSON only.',
      user: prompt,
      schemaName: 'chunk_analysis_payload',
      schema: chunkAnalysisSchema,
    });
  }

  return buildDeterministicChunkAnalysis(chunkTextValue);
}

async function mergeAnalysesWithAI(fileName, chunkAnalyses, studyMode, difficulty) {
  const serialized = JSON.stringify(chunkAnalyses);
  const prompt = [
    'Combine the following extracted data into one final structured learning output.',
    'Requirements:',
    '* Do NOT miss any topic',
    '* Remove duplicates',
    '* Organize clearly into sections',
    '* Keep it simple and useful for students',
    `* Study mode: ${studyMode}`,
    `* Difficulty: ${difficulty}`,
    'Format:',
    '1. Summary',
    '2. Key Concepts (with explanations)',
    '3. Important Points',
    '4. Real-life understanding (if possible)',
    '5. Mode Guidance',
    'Return strict JSON only with this shape:',
    '{"title":"","summary":"","keyConcepts":[{"concept":"","explanation":""}],"importantPoints":[""],"realLifeUnderstanding":"","modeGuidance":""}',
    `File name: ${fileName}`,
    `Data:\n${serialized}`,
  ].join('\n');

  if (hasGemini) {
    return generateJsonGemini(prompt);
  }

  if (openai) {
    return generateJsonOpenAI({
      system: 'Combine chunk analyses into one complete student study guide. Do not miss topics. Return JSON only.',
      user: prompt,
      schemaName: 'final_document_learning_payload',
      schema: finalDocumentSchema,
    });
  }

  return null;
}

async function generateQuizWithAI(finalOutput, difficulty = 'Medium') {
  const serialized = JSON.stringify(finalOutput);
  const prompt = [
    'Based on this content, generate 5 multiple-choice questions with correct answers.',
    `Difficulty: ${difficulty}`,
    'Return strict JSON only with this shape:',
    '{"quiz":[{"question":"","options":["","","",""],"answer":"","explanation":"","concept":""}]}',
    `Content:\n${serialized}`,
  ].join('\n');

  if (hasGemini) {
    return generateJsonGemini(prompt);
  }

  if (openai) {
    return generateJsonOpenAI({
      system: 'Create a 5-question MCQ quiz grounded in the provided study guide. Return JSON only.',
      user: prompt,
      schemaName: 'final_document_quiz_payload',
      schema: quizSchema,
    });
  }

  return buildDeterministicQuiz(finalOutput, difficulty);
}

function normalizeDocumentOutput(finalOutput, quizOutput, metadata, studyMode, difficulty) {
  return {
    title: finalOutput.title,
    summary: finalOutput.summary,
    keyConcepts: finalOutput.keyConcepts,
    importantPoints: finalOutput.importantPoints,
    realLifeUnderstanding: finalOutput.realLifeUnderstanding,
    modeGuidance: finalOutput.modeGuidance || buildModeGuidance(studyMode, difficulty),
    quiz: quizOutput.quiz,
    metadata,
    studyMode,
    difficulty,
  };
}

async function generateLiveDocumentLearning(fileName, content, studyMode = 'Quick Summary', difficulty = 'Medium') {
  const cleanedText = cleanText(content);
  const chunks = chunkText(cleanedText);

  if (!chunks.length) {
    throw new Error('The uploaded file did not contain enough readable text to analyze.');
  }

  const chunkAnalyses = [];
  for (let index = 0; index < chunks.length; index += 1) {
    try {
      const analysis = await analyzeChunkWithAI(chunks[index], index, chunks.length);
      chunkAnalyses.push(analysis);
    } catch (error) {
      console.warn(`Chunk ${index + 1} analysis failed, using deterministic fallback.`, error);
      chunkAnalyses.push(buildDeterministicChunkAnalysis(chunks[index]));
    }
  }

  let finalOutput;
  try {
    finalOutput = await mergeAnalysesWithAI(fileName, chunkAnalyses, studyMode, difficulty);
  } catch (error) {
    console.warn('Final merge failed, using deterministic merge.', error);
  }

  if (!finalOutput) {
    finalOutput = buildDeterministicMergedDocument(fileName, cleanedText, chunkAnalyses, studyMode, difficulty);
  }

  let quizOutput;
  try {
    quizOutput = await generateQuizWithAI(finalOutput, difficulty);
  } catch (error) {
    console.warn('Quiz generation failed, using deterministic quiz.', error);
    quizOutput = buildDeterministicQuiz(finalOutput, difficulty);
  }

  return normalizeDocumentOutput(finalOutput, quizOutput, {
    chunkCount: chunks.length,
    cleanedLength: cleanedText.length,
  }, studyMode, difficulty);
}

async function askLiveAssistant(prompt, context) {
  const teacherPrompt = [
    'You are NeuroVerse, an inspiring education assistant.',
    'Explain concepts simply, accurately, and briefly.',
    'End with one follow-up question.',
    `Topic: ${context?.topic || 'General science'}`,
    `Question: ${prompt}`,
  ].join('\n');

  if (hasGemini) {
    try {
      const payload = await generateWithGemini(teacherPrompt);
      return { reply: extractTextFromGemini(payload) || 'I could not generate a response just now.', source: 'gemini', model: lastResolvedGeminiModel };
    } catch (error) {
      recordProviderError('gemini', error);
      console.warn('Gemini assistant failed, using fallback response.', error);
    }
  }

  if (openai) {
    try {
      const response = await openai.responses.create({
        model: openAIModel,
        input: [
          { role: 'system', content: 'You are NeuroVerse, an inspiring education assistant. Explain concepts simply, accurately, and briefly. End with one follow-up question.' },
          { role: 'user', content: teacherPrompt },
        ],
      });
      return { reply: response.output_text || 'I could not generate a response just now.', source: 'openai' };
    } catch (error) {
      recordProviderError('openai', error);
      console.warn('OpenAI assistant failed, using fallback response.', error);
    }
  }

  return {
    reply: `NeuroVerse demo mode: ${prompt} relates to ${context?.topic || 'this topic'}. ${getProviderDebugMessage()}`,
    source: 'fallback',
    error: getProviderDebugMessage(),
  };
}

async function generateTopicLearningWithAI(topic, studyMode = 'Quick Summary', difficulty = 'Medium') {
  const prompt = [
    'Explain the topic for students in a useful, structured, and memorable way.',
    `Topic: ${topic}`,
    `Study mode: ${studyMode}`,
    `Difficulty: ${difficulty}`,
    'Return strict JSON only with this shape:',
    '{"title":"","explanation":"","keyPoints":["","",""],"realLifeExample":"","modeGuidance":"","quiz":[{"question":"","options":["","","",""],"answer":"","explanation":"","concept":""}]}',
    'Requirements:',
    '- Explanation must be student-friendly and accurate',
    '- Key points must be memorable and revision-friendly',
    '- Real-life example must connect the topic to reality',
    '- Generate exactly 3 MCQs with correct answers',
    '- Each quiz question must mention a concept label in the concept field',
  ].join('\n');

  if (hasGemini) {
    return generateJsonGemini(prompt);
  }

  if (openai) {
    return generateJsonOpenAI({
      system: 'You are an expert teacher creating structured learning content for students. Return JSON only.',
      user: prompt,
      schemaName: 'topic_learning_payload',
      schema: topicLearningSchema,
    });
  }

  return null;
}

async function generateLiveLearning(topic, studyMode = 'Quick Summary', difficulty = 'Medium') {
  try {
    const result = await generateTopicLearningWithAI(topic, studyMode, difficulty);
    if (result) {
      return { ...result, studyMode, difficulty };
    }
  } catch (error) {
    recordProviderError(activeProvider, error);
    console.warn('Topic learning generation failed, using fallback.', error);
  }

  return getFallbackLearning(topic, studyMode, difficulty);
}

async function generateLiveQuiz(topic, difficulty = 'Medium') {
  const learning = await generateLiveLearning(topic, 'Exam Prep', difficulty);
  return { questions: learning.quiz, source: activeProvider };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    provider: activeProvider,
    hasOpenAI,
    hasGemini,
    openAIModel: hasOpenAI ? openAIModel : null,
    geminiModel: hasGemini ? geminiModel : null,
    resolvedGeminiModel: hasGemini ? lastResolvedGeminiModel : null,
    lastProviderError,
  });
});

app.post('/api/learn', async (req, res) => {
  const { topic, studyMode = 'Quick Summary', difficulty = 'Medium' } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Topic is required.' });

  try {
    const result = await generateLiveLearning(topic, studyMode, difficulty);
    res.json(result);
  } catch (error) {
    console.error('Topic learning error', error);
    res.status(500).json({ error: 'Unable to generate learning content right now.' });
  }
});

app.post('/api/learn-from-document', async (req, res) => {
  const { fileName, content, studyMode = 'Quick Summary', difficulty = 'Medium' } = req.body || {};
  if (!fileName || !content) return res.status(400).json({ error: 'File name and extracted content are required.' });

  try {
    const result = await generateLiveDocumentLearning(fileName, content, studyMode, difficulty);
    res.json(result);
  } catch (error) {
    console.error('Document learning error', error);
    res.status(500).json({ error: 'Unable to analyze the document right now.' });
  }
});

app.post('/api/assistant', async (req, res) => {
  const { prompt, context } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
  const result = await askLiveAssistant(prompt, context);
  res.json(result);
});

app.post('/api/quiz', async (req, res) => {
  const { topic, difficulty = 'Medium' } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Topic is required.' });
  const result = await generateLiveQuiz(topic, difficulty);
  res.json(result);
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`NeuroVerse API listening on http://localhost:${port}`);
  });
}

export default app;

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getDefaultProgress, loadLocalProgress, saveLocalProgress } from './storage';

function normalizeTopicLabel(value = '') {
  return value.trim();
}

function formatWeaknessLabel(label = '') {
  return label.trim() || 'core concepts';
}

export async function getUserProgress(uid) {
  if (!uid) {
    return getDefaultProgress();
  }

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return { ...getDefaultProgress(), ...snap.data() };
      }

      const seeded = getDefaultProgress();
      await setDoc(ref, seeded);
      return seeded;
    } catch (error) {
      console.warn('Falling back to local progress store because Firestore is unavailable.', error);
    }
  }

  return loadLocalProgress(uid);
}

export async function saveUserProgress(uid, progress) {
  if (!uid) {
    return;
  }

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, progress, { merge: true });
      return;
    } catch (error) {
      console.warn('Saving progress locally because Firestore write failed.', error);
    }
  }

  saveLocalProgress(uid, progress);
}

function mergeWeakTopics(existingWeakTopics = [], weakTopics = [], topicLabel = '') {
  const weakMap = new Map(existingWeakTopics.map((item) => [item.label.toLowerCase(), item]));

  weakTopics.forEach((item) => {
    const label = formatWeaknessLabel(item.label || item.concept || item.topic || item.question);
    const key = label.toLowerCase();
    const previous = weakMap.get(key);

    weakMap.set(key, {
      label,
      topic: normalizeTopicLabel(item.topic || topicLabel),
      count: (previous?.count || 0) + 1,
      lastSeenAt: new Date().toISOString(),
      suggestion: `You should focus more on ${label}. Review the explanation, remember the key points, and retry a quiz after quick revision.`,
    });
  });

  return [...weakMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);
}

export function buildUpdatedProgress(progress, quizOutcome) {
  const totalQuestions = quizOutcome.totalQuestions || 3;
  const nextXp = progress.xp + quizOutcome.xpEarned;
  const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);
  const nextBadges = new Set(progress.badges);
  const topicLabel = normalizeTopicLabel(quizOutcome.topic);
  const isDocument = quizOutcome.sourceType === 'document';
  const weakTopics = mergeWeakTopics(progress.weakTopics, quizOutcome.weakTopics || [], topicLabel);

  // Awarding 10 Core Badges
  nextBadges.add('Neuro Starter'); // If they finish a quiz, they started

  if (quizOutcome.score === totalQuestions) {
    nextBadges.add('Precision Master');
  }

  if (quizOutcome.score >= 3) { // 3+ correct in a row/total in this session
    nextBadges.add('Streak Champion');
  }

  if (progress.completedTopics.length >= 5) {
    nextBadges.add('Explorer');
  }

  if (quizOutcome.studyMode === 'Deep Learning') {
    nextBadges.add('Deep Learner');
  }

  if (isDocument) {
    nextBadges.add('Doc Analyzer');
  }

  if (quizOutcome.sourceType === 'challenge' || quizOutcome.score > totalQuestions * 0.9) {
    nextBadges.add('Challenge Winner');
  }

  if (nextXp >= 1000) {
    nextBadges.add('Neuro Master');
  }

  // Fallback logic for speed/ai collaborator would happen elsewhere or here if metadata available
  if (quizOutcome.responseTime < 10000) { // e.g. < 10s per question average
    nextBadges.add('Quick Thinker');
  }

  const activityLabel = `${isDocument ? 'Learned from document' : 'Completed'} ${topicLabel} quiz with ${quizOutcome.score}/${totalQuestions}`;
  const weaknessActivity = quizOutcome.weakTopics?.length
    ? {
        id: `${Date.now()}_weakness`,
        label: `Weak areas detected: ${quizOutcome.weakTopics.map((item) => formatWeaknessLabel(item.label || item.concept || item.question)).slice(0, 2).join(', ')}`,
        time: 'Just now',
      }
    : null;

  return {
    ...progress,
    xp: nextXp,
    level: nextLevel,
    completedTopics: Array.from(new Set([...progress.completedTopics, topicLabel])),
    recentTopics: [topicLabel, ...progress.recentTopics.filter((item) => item !== topicLabel)].slice(0, 6),
    uploadedTopics: isDocument
      ? [topicLabel, ...progress.uploadedTopics.filter((item) => item !== topicLabel)].slice(0, 6)
      : progress.uploadedTopics,
    weakTopics,
    quizResults: [quizOutcome, ...progress.quizResults].slice(0, 10),
    recentActivity: [
      {
        id: `${Date.now()}`,
        label: activityLabel,
        time: 'Just now',
      },
      ...(weaknessActivity ? [weaknessActivity] : []),
      ...progress.recentActivity,
    ].slice(0, 6),
    badges: Array.from(nextBadges),
  };
}

export function buildSavedTopicProgress(progress, topicData) {
  const topicLabel = normalizeTopicLabel(topicData.title || topicData.topic || 'Untitled Topic');
  const savedTopic = {
    id: topicData.id || `${topicLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: topicLabel,
    studyMode: topicData.studyMode || 'Quick Summary',
    difficulty: topicData.difficulty || 'Medium',
    sourceType: topicData.sourceType || 'topic',
    savedAt: topicData.savedAt || new Date().toISOString(),
  };

  return {
    ...progress,
    savedTopics: [savedTopic, ...progress.savedTopics.filter((item) => item.title !== topicLabel)].slice(0, 12),
    recentActivity: [
      {
        id: `${Date.now()}_saved`,
        label: `Saved ${topicLabel} to your study library`,
        time: 'Just now',
      },
      ...progress.recentActivity,
    ].slice(0, 6),
  };
}

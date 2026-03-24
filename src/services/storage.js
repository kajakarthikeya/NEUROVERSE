const PROGRESS_KEY = 'neuroverse_progress';

const defaultProgress = {
  xp: 0,
  level: 1,
  streak: 1,
  completedTopics: [],
  recentTopics: [],
  uploadedTopics: [],
  savedTopics: [],
  weakTopics: [],
  recentActivity: [{ id: 'welcome', label: 'Started your NeuroVerse journey', time: 'Just now' }],
  badges: ['NeuroVerse Pioneer'],
  quizResults: [],
};

export function loadLocalProgress(uid) {
  const raw = window.localStorage.getItem(`${PROGRESS_KEY}_${uid}`);
  return raw ? { ...defaultProgress, ...JSON.parse(raw) } : getDefaultProgress();
}

export function saveLocalProgress(uid, data) {
  window.localStorage.setItem(`${PROGRESS_KEY}_${uid}`, JSON.stringify(data));
}

export function getDefaultProgress() {
  return {
    ...defaultProgress,
    completedTopics: [...defaultProgress.completedTopics],
    recentTopics: [...defaultProgress.recentTopics],
    uploadedTopics: [...defaultProgress.uploadedTopics],
    savedTopics: [...defaultProgress.savedTopics],
    weakTopics: [...defaultProgress.weakTopics],
    recentActivity: [...defaultProgress.recentActivity],
    badges: [...defaultProgress.badges],
    quizResults: [...defaultProgress.quizResults],
  };
}

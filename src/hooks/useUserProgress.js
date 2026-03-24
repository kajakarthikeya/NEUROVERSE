import { useEffect, useState } from 'react';
import { buildSavedTopicProgress, buildUpdatedProgress, getUserProgress, saveUserProgress } from '../services/progress';

export function useUserProgress(user) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user) {
        setProgress(null);
        setError('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getUserProgress(user.uid);
        if (mounted) {
          setProgress(data);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load progress right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function persist(updated) {
    if (!user) {
      return;
    }

    setProgress(updated);

    try {
      await saveUserProgress(user.uid, updated);
    } catch (saveError) {
      setError(saveError.message || 'Progress was updated locally but could not be synced.');
    }
  }

  async function applyQuizResult(result) {
    if (!user || !progress) {
      return;
    }

    const updated = buildUpdatedProgress(progress, result);
    await persist(updated);
  }

  async function saveTopic(topicData) {
    if (!user || !progress) {
      return;
    }

    const updated = buildSavedTopicProgress(progress, topicData);
    await persist(updated);
  }

  return { progress, loading, error, applyQuizResult, saveTopic };
}

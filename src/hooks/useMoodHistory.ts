import { useState, useEffect, useCallback } from 'react';
import { MoodAnalysis, MoodHistory } from '@/types/mood';

const STORAGE_KEY = 'mindtrack_mood_history';
const MAX_ENTRIES = 30; // Keep last 30 entries

export function useMoodHistory() {
  const [history, setHistory] = useState<MoodAnalysis[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: MoodHistory = JSON.parse(stored);
        setHistory(parsed.entries || []);
      }
    } catch (error) {
      console.error('Failed to load mood history:', error);
    }
  }, []);

  // Save entry to history
  const addEntry = useCallback((entry: MoodAnalysis) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: updated }));
      } catch (error) {
        console.error('Failed to save mood history:', error);
      }
      return updated;
    });
  }, []);

  // Get last 7 days of entries for the chart
  const getLast7Days = useCallback(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Group entries by date and calculate average stress score
    const entriesByDate = new Map<string, number[]>();
    
    history.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= sevenDaysAgo) {
        const dateKey = entryDate.toISOString().split('T')[0];
        const scores = entriesByDate.get(dateKey) || [];
        scores.push(entry.stressScore);
        entriesByDate.set(dateKey, scores);
      }
    });

    // Create data for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const scores = entriesByDate.get(dateKey);
      const avgScore = scores ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        shortDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
        stressScore: avgScore,
        hasData: avgScore !== null,
      });
    }

    return chartData;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addEntry,
    getLast7Days,
    clearHistory,
    hasHistory: history.length > 0,
  };
}

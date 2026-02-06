'use client';

import { useState, useEffect } from 'react';
import { NewsItem } from '@/lib/types';

interface UseRealTimeNewsProps {
  interval?: number; // Update interval in seconds
  autoRefresh?: boolean;
}

export function useRealTimeNews({ interval = 30, autoRefresh = true }: UseRealTimeNewsProps = {}) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newItemsCount, setNewItemsCount] = useState(0);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        setNews(data);
        setLastUpdated(new Date());
        setNewItemsCount(prev => prev + 1); // Increment to show new items indicator
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchNews();
    }, interval * 1000);

    return () => clearInterval(intervalId);
  }, [interval, autoRefresh]);

  const manualRefresh = () => {
    setNewItemsCount(0); // Reset counter on manual refresh
    fetchNews();
  };

  return {
    news,
    loading,
    lastUpdated,
    newItemsCount,
    manualRefresh,
    hasNewItems: newItemsCount > 0
  };
}
'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/lib/types';

interface LiveTickerProps {
  items: NewsItem[];
  maxItems?: number;
  speed?: number; // Characters per second
  className?: string;
}

export function LiveTicker({ 
  items, 
  maxItems = 10, 
  speed = 50, 
  className = '' 
}: LiveTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const visibleItems = items.slice(0, maxItems);

  useEffect(() => {
    if (visibleItems.length === 0 || isPaused) return;

    const currentNews = visibleItems[currentIndex];
    const fullText = `${currentNews.title} - ${currentNews.source}`;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, charIndex));
        charIndex++;
      } else {
        // Move to next item after pausing
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % visibleItems.length);
          setDisplayText('');
        }, 2000);
      }
    }, 1000 / speed);

    return () => clearInterval(typeInterval);
  }, [currentIndex, visibleItems, speed, isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (visibleItems.length === 0) {
    return (
      <div className={`bg-gray-900 text-green-400 px-4 py-2 ${className}`}>
        No news available
      </div>
    );
  }

  return (
    <div 
      className={`bg-gray-900 text-green-400 px-4 py-2 overflow-hidden whitespace-nowrap ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center">
        <span className="mr-2 animate-pulse">▶</span>
        <span>{displayText}</span>
        <span className="ml-2">|</span>
      </div>
      <div className="text-xs text-green-600 mt-1">
        Live News Feed • {visibleItems.length} sources
      </div>
    </div>
  );
}
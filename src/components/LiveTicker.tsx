'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem } from '@/lib/types';

interface LiveTickerProps {
  items: NewsItem[];
  maxItems?: number;
  speed?: number;
  className?: string;
}

export function LiveTicker({ 
  items, 
  maxItems = 5, 
  speed = 30, 
  className = '' 
}: LiveTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const visibleItems = Array.isArray(items) ? items.slice(0, maxItems) : [];

  useEffect(() => {
    if (visibleItems.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % visibleItems.length);
        setIsVisible(true);
      }, 1000);
    }, (60 / speed) * 1000);

    return () => clearInterval(interval);
  }, [visibleItems.length, speed]);

  const handleMouseEnter = () => {
    setIsVisible(false);
  };

  const handleMouseLeave = () => {
    setIsVisible(true);
    setCurrentIndex(0);
  };

  if (visibleItems.length === 0) {
    return (
      <div className={`bg-gray-800 text-green-400 px-4 py-3 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <span className="text-sm">No news available</span>
        </div>
      </div>
    );
  }

  const currentNews = visibleItems[currentIndex];

  return (
    <div 
      className={`bg-gray-800 text-green-400 px-4 py-3 rounded-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-2xl"
        >
          📡
        </motion.div>
        <span className="text-xs text-green-600 uppercase tracking-wider font-mono">
          Live News Feed
        </span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-1 h-px bg-green-600"
        />
        <span className="text-xs text-green-600 font-mono">
          {visibleItems.length} sources
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-500"
              >
                ▶
              </motion.span>
              <h3 className="font-mono text-sm font-bold text-green-300 truncate">
                {currentNews.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-600 font-mono">
              <span>📰</span>
              <span className="truncate">{currentNews.source}</span>
              <span>•</span>
              <span>{currentNews.category}</span>
              <span>•</span>
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                LIVE
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
          <motion.div
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: (60 / speed), repeat: Infinity, ease: 'linear' }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
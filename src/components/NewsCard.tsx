'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { NewsItem } from '@/lib/types';

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export function NewsCard({ news, index }: NewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'OpenClaw': 'text-cyan-400',
      'ClawBot': 'text-green-400',
      'API': 'text-blue-400',
      'AI': 'text-purple-400',
      'Web3': 'text-yellow-400',
      'Machine Learning': 'text-pink-400',
      'Web Development': 'text-indigo-400',
      'Community': 'text-orange-400',
      'How-To': 'text-teal-400',
      'General': 'text-gray-400'
    };
    return colors[category] || 'text-gray-400';
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        boxShadow: "0 20px 40px rgba(0, 255, 136, 0.3)"
      }}
      className="cyber-card relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h2 className="text-xl font-bold cyber-glow-text mb-1 leading-tight">
              {news.title}
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full bg-gray-700 ${getCategoryColor(news.category)}`}>
                {news.category}
              </span>
              <span className="text-gray-500">
                {formatDate(news.timestamp)}
              </span>
            </div>
          </div>
          
          {/* Score badge */}
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(news.score)} bg-gray-800`}
          >
            {news.score}%
          </motion.div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-3">
          {news.description}
        </p>

        {/* Source and actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
              {news.source.charAt(0)}
            </div>
            <span className="text-sm text-gray-400">{news.source}</span>
          </div>

          {/* Action buttons */}
          <motion.div 
            className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={false}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Bookmark"
            >
              <span className="text-lg">🔖</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Share"
            >
              <span className="text-lg">🔗</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded bg-gray-700 hover:bg-green-600 transition-colors"
              title="Read more"
            >
              <span className="text-lg">→</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Progress bar for score */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${news.score}%` }}
              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              className={`h-full rounded-full ${
                news.score >= 90 ? 'bg-green-500' : 
                news.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Neon border effect */}
      <div className={`absolute inset-0 rounded-lg border-2 ${
        isHovered ? 'border-green-400' : 'border-transparent'
      } opacity-30 transition-all duration-300`} />
    </motion.div>
  );
}
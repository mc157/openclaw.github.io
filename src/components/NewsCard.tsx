'use client';

import { NewsItem } from '@/lib/types';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-cyan-400 mb-2">{news.title}</h2>
      <p className="text-gray-300 mb-4">{news.content}</p>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Source: {news.source}</span>
        <span>Score: {news.score}</span>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        {news.author && <span>Author: {news.author}</span>}
      </div>
    </div>
  );
}
'use client';

import { NewsCard } from '@/components/NewsCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { LiveTicker } from '@/components/LiveTicker';
import { useRealTimeNews } from '@/hooks/useRealTimeNews';
import { useState, useEffect } from 'react';

export default function Home() {
  const { news, loading, lastUpdated, manualRefresh, hasNewItems } = useRealTimeNews();
  const [filteredNews, setFilteredNews] = useState(news);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let filtered = news;
    
    if (selectedCategory !== 'All') {
      filtered = news.filter(item => item.category === selectedCategory);
    }
    
    setFilteredNews(filtered);
  }, [news, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-cyan-400">ClawBot News Hub</h1>
              <p className="text-gray-300">Cyberpunk News Aggregation</p>
              <div className="text-sm text-gray-400 mt-2">
                Updated: {formatLastUpdated(lastUpdated)}
                {hasNewItems && (
                  <span className="ml-2 text-green-400 animate-pulse">
                    🔴 {news.length} sources live
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={manualRefresh}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </div>
            
            <div className="space-y-6">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No news found for this category.</p>
                  <p className="text-sm mt-2">Try selecting a different category or refreshing.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <LiveTicker items={news} />
          </div>
        </div>
      </main>
    </div>
  );
}
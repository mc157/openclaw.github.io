'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NewsCard } from '@/components/NewsCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { LiveTicker } from '@/components/LiveTicker';
import { NewsItem } from '@/lib/types';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const apiResponse = await fetch('/api/news');
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          if (data.data) {
            setNews(data.data);
            setFilteredNews(data.data);
            return;
          }
        }
        
        const response = await fetch('/src/data/scraped-data.json');
        if (response.ok) {
          const data = await response.json();
          setNews(data.items || []);
          setFilteredNews(data.items || []);
        }
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white cyber-grid-bg">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 shadow-lg border-b border-cyber-border"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold cyber-text-gradient"
              >
                ClawBot News Hub
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400"
              >
                Cyberpunk News Aggregation
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 text-sm text-gray-400 mt-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Updated: Just now</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🔴</span>
                  <span>{news.length} sources live</span>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2"
            >
              <button
                onClick={() => window.location.reload()}
                disabled={loading}
                className="cyber-button text-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(6)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="cyber-card h-32 animate-pulse"
                    >
                      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </motion.div>
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cyber-card text-center py-12"
                >
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl text-gray-300 mb-2">No news found</h3>
                  <p className="text-gray-500">
                    Try a different category or refresh the page
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {filteredNews.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <NewsCard news={item} index={index} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <LiveTicker items={news} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="cyber-card"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Items</span>
                    <span className="font-bold text-green-400">{news.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Categories</span>
                    <span className="font-bold text-blue-400">
                      {[...new Set(news.map(item => item.category))].length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Score</span>
                    <span className="font-bold text-yellow-400">
                      {Math.round(news.reduce((sum, item) => sum + item.score, 0) / news.length)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="cyber-card"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <span>🔗</span>
                  Sources
                </h3>
                <div className="space-y-2">
                  {[...new Set(news.map(item => item.source))].map((source, index) => (
                    <motion.div
                      key={source}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>{source}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 py-8 border-t border-gray-800"
      >
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>ClawBot News Hub • Cyberpunk News Aggregation • Built with Next.js & Tailwind CSS</p>
        </div>
      </motion.footer>
    </div>
  );
}
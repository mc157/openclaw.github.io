'use client';

import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: 'All', label: 'All', icon: '🌐', color: 'text-white' },
  { id: 'OpenClaw', label: 'OpenClaw', icon: '🤖', color: 'text-cyan-400' },
  { id: 'ClawBot', label: 'ClawBot', icon: '🦾', color: 'text-green-400' },
  { id: 'API', label: 'API', icon: '⚡', color: 'text-yellow-400' },
  { id: 'AI', label: 'AI', icon: '🧠', color: 'text-purple-400' },
  { id: 'Models', label: 'Models', icon: '📊', color: 'text-blue-400' },
  { id: 'How-To', label: 'How-To', icon: '📖', color: 'text-teal-400' },
  { id: 'General', label: 'General', icon: '💬', color: 'text-gray-400' }
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                flex items-center gap-2 relative overflow-hidden
                ${isSelected 
                  ? 'bg-gray-700 text-white shadow-lg' 
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              {/* Animated background */}
              {isSelected && (
                <motion.div
                  layoutId="categoryBg"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-green-500 opacity-20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Icon and label */}
              <span className="text-lg">{category.icon}</span>
              <span className={`relative z-10 ${isSelected ? 'text-white' : category.color}`}>
                {category.label}
              </span>
              
              {/* Glow effect when selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
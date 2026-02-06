/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk theme colors
        'cyber-blue': '#00d4ff',
        'cyber-green': '#00ff88',
        'cyber-purple': '#a29bfe',
        'cyber-pink': '#fd79a8',
        'cyber-dark': '#0f0f0f',
        'cyber-gray': '#1a1a1a',
        'cyber-border': '#333333',
        'neon-glow': '#00ff8850',
        'neon-glow-blue': '#00d4ff50',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide': 'slide 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88' },
          'to': { boxShadow: '0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88' },
        },
        slide: {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(-100%)' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)',
        'cyber-grid-blue': 'linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
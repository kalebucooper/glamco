/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        cream: '#f8f3ee',
        blush: '#e8b4b8',
        rose: '#c4636a',
        gold: '#d4a853',
        plum: '#4a1942',
        electric: '#ff4d8d',
        'card-bg': '#1c161c',
        'dark-surface': '#141014',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #ff4d8d, #c4636a)',
        'gradient-gold': 'linear-gradient(135deg, #d4a853, #e8b4b8)',
      },
    },
  },
  plugins: [],
}

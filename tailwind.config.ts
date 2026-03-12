import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        electric: '#ff4d8d',
        blush: '#ffb3cc',
        cream: '#f8f3ee',
        'card-bg': '#1c161c',
        'deep-black': '#0a060a',
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #ff4d8d 0%, #c94bff 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a060a 0%, #120e12 100%)',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        'white/08': 'rgba(255,255,255,0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease forwards',
        'fade-in': 'fade-in 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config

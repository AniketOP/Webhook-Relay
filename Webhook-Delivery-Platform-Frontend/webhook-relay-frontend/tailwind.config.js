/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base:    '#04070F',
          surface: '#080D1A',
          card:    '#0D1322',
          hover:   '#111827',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          bright:  'rgba(255,255,255,0.13)',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        sky: {
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        text: {
          primary:   '#F1F5F9',
          secondary: '#94A3B8',
          faint:     '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow:    { from: { boxShadow: '0 0 5px rgba(124,58,237,0.3)' }, to: { boxShadow: '0 0 20px rgba(124,58,237,0.7)' } },
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow':         'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)',
        'sidebar-gradient':  'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 40%)',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
        'violet':     '0 0 20px rgba(124,58,237,0.4)',
        'glow-sm':    '0 0 8px rgba(124,58,237,0.5)',
      },
    },
  },
  plugins: [],
};

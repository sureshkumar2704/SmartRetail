/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A0F1E',
        surface: '#111827',
        teal: '#00D4AA',
        warning: '#F59E0B',
        danger: '#EF4444',
        textPrimary: '#F9FAFB',
        textMuted: '#6B7280',
      },
      boxShadow: {
        glow: '0 0 45px rgba(0, 212, 170, 0.22)',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at top, rgba(0,212,170,0.16), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.05), transparent)',
      },
    },
  },
  plugins: [],
};

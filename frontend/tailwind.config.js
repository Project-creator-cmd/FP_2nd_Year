/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 20px 60px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.35)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'glow-xl': '0 0 60px rgba(99, 102, 241, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.35)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.35)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
          950: '#1e1b4b'
        },
        violet: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.06) 0px, transparent 50%)',
        'hero-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInScale: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideInLeft: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        floatSlow: { '0%,100%': { transform: 'translateY(0px) rotate(0deg)' }, '50%': { transform: 'translateY(-8px) rotate(2deg)' } },
        blob: { '0%,100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' }, '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulse2: { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.7', transform: 'scale(1.05)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        countUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        gradientShift: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        ripple: { '0%': { transform: 'scale(0)', opacity: '1' }, '100%': { transform: 'scale(4)', opacity: '0' } },
        bounceIn: { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        splashText: { '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)' }, '60%': { opacity: '1', transform: 'scale(1.02) translateY(-4px)' }, '100%': { opacity: '1', transform: 'scale(1) translateY(0)' } },
        ticker: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        glow: { '0%,100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.6)' } },
        aurora: {
          '0%': { backgroundPosition: '0% 50%', opacity: '0.5' },
          '50%': { backgroundPosition: '100% 50%', opacity: '0.8' },
          '100%': { backgroundPosition: '0% 50%', opacity: '0.5' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        morphBg: {
          '0%,100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'rotate(0deg) scale(1)' },
          '33%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'rotate(120deg) scale(1.05)' },
          '66%': { borderRadius: '50% 50% 30% 70% / 40% 70% 30% 60%', transform: 'rotate(240deg) scale(0.95)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        numberRoll: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        borderGlow: {
          '0%,100%': { borderColor: 'rgba(99,102,241,0.3)' },
          '50%': { borderColor: 'rgba(99,102,241,0.8)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        textGlow: {
          '0%,100%': { textShadow: '0 0 10px rgba(99,102,241,0.3)' },
          '50%': { textShadow: '0 0 20px rgba(99,102,241,0.7), 0 0 40px rgba(99,102,241,0.3)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-scale': 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse2': 'pulse2 2s ease-in-out infinite',
        'count-up': 'countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'splash-text': 'splashText 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'ticker': 'ticker 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'aurora': 'aurora 8s ease infinite',
        'orbit': 'orbit 12s linear infinite',
        'morph-bg': 'morphBg 12s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'number-roll': 'numberRoll 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'border-glow': 'borderGlow 2s ease-in-out infinite',
        'text-glow': 'textGlow 3s ease-in-out infinite',
      }
    }
  },
  plugins: []
}

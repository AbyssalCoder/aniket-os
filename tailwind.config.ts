import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f0ff',
          purple: '#8b5cf6',
          pink: '#ff006e',
          blue: '#0066ff',
        },
        dark: {
          950: '#030308',
          900: '#050510',
          800: '#0a0a1a',
          700: '#0f0f2a',
          600: '#15153a',
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'border-flow': 'border-flow 3s linear infinite',
        'fade-up': 'fade-up 0.8s ease-out forwards',
        flicker: 'flicker 0.15s infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0,240,255,0.2), inset 0 0 15px rgba(0,240,255,0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(0,240,255,0.4), inset 0 0 30px rgba(0,240,255,0.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}

export default config

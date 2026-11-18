/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: '#080A0F',
        surface: '#0F1218',
        elevated: '#161B24',
        elevated2: '#1D2330',
        border: '#1F2635',
        borderStrong: '#2D3650',
        borderGlow: '#3B82F640',
        textMain: '#EDF0F5',
        textSub: '#C8CDD8',
        textMuted: '#8A94A6',
        textDim: '#525D72',
        accent: '#3B82F6',
        accentHover: '#2563EB',
        accentSoft: '#3B82F614',
        accentGlow: '#3B82F630',
        amber: '#F59E0B',
        amberSoft: '#F59E0B18',
        success: '#22C55E',
        successSoft: '#22C55E18',
        danger: '#EF4444',
        dangerSoft: '#EF444418',
        purple: '#A855F7',
        purpleSoft: '#A855F714',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.4' },
        },
        'blink-cursor': {
          '0%,49%': { opacity: '1' },
          '50%,100%': { opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'toast-in': {
          from: { transform: 'translateY(16px) scale(0.96)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'toast-out': {
          from: { transform: 'translateY(0) scale(1)', opacity: '1' },
          to: { transform: 'translateY(8px) scale(0.96)', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.5)' },
          '70%': { boxShadow: '0 0 0 6px rgba(59,130,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease both',
        'fade-in': 'fade-in 0.4s ease both',
        shimmer: 'shimmer 2.5s linear infinite',
        pulse2: 'pulse2 2s ease infinite',
        'blink-cursor': 'blink-cursor 1s infinite',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(.16,1,.3,1)',
        'slide-in-down': 'slide-in-down 0.25s ease both',
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'toast-in': 'toast-in 0.25s cubic-bezier(.16,1,.3,1) forwards',
        'toast-out': 'toast-out 0.2s ease forwards',
        'pulse-ring': 'pulse-ring 2s ease infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 24px 0 rgba(59,130,246,0.18)',
        'glow-blue-lg': '0 0 48px 0 rgba(59,130,246,0.14)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};
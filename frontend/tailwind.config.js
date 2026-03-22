/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ========== COLOR SYSTEM ==========
      colors: {
        // Brand colors
        'primary': '#2f6f6d',
        'primary-light': '#4a8e8b',
        'primary-dark': '#1d4644',
        'accent': '#e58c6b',
        'accent-light': '#f0a884',
        'accent-dark': '#d67a52',

        // Status colors
        'success': '#3f9b87',
        'success-light': '#6fb3a3',
        'success-dark': '#2d7a68',
        'warning': '#f2a35b',
        'warning-light': '#f7b87d',
        'warning-dark': '#d68c3d',
        'danger': '#d86a6a',
        'danger-light': '#e68989',
        'danger-dark': '#b84d4d',

        // Soft backgrounds (calm palette)
        'soft-lavender': '#f4f6f2',
        'soft-peach': '#fce7d8',
        'soft-mint': '#dff3ee',
        'soft-blue': '#e6f0ff',
        'soft-rose': '#fde7e7',

        // Neutral palette
        'slate-50': '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-900': '#0f172a',
      },

      // ========== TYPOGRAPHY ==========
      fontFamily: {
        sans: ['var(--font-sans)', 'Manrope', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'Fraunces', 'ui-serif', 'Georgia'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.5px' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.5px' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.5px' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-1px' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-1px' }],
      },

      // ========== SPACING ==========
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-left': 'max(1rem, env(safe-area-inset-left))',
        'safe-right': 'max(1rem, env(safe-area-inset-right))',
      },

      // ========== BORDER RADIUS ==========
      borderRadius: {
        'sm': '6px',
        'base': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },

      // ========== SHADOWS ==========
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'card': '0 6px 18px rgba(15, 23, 42, 0.08)',
        'elevated': '0 16px 40px rgba(15, 23, 42, 0.12)',
        'lg': '0 20px 50px rgba(15, 23, 42, 0.15)',
        'xl': '0 25px 60px rgba(15, 23, 42, 0.2)',
        'glow-primary': '0 0 20px rgba(47, 111, 109, 0.15)',
        'glow-accent': '0 0 20px rgba(229, 140, 107, 0.15)',
      },

      // ========== ANIMATIONS ==========
      keyframes: {
        // Micro-interactions
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },

        // Voice & waveform
        'voice-pulse': {
          '0%, 100%': { transform: 'scaleY(0.4)', opacity: '0.6' },
          '50%': { transform: 'scaleY(1)', opacity: '1' },
        },

        // Shimmer (skeleton loader)
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },

        // Spin (loading)
        'spin-soft': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-left': 'slide-left 0.3s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'bounce-soft': 'bounce-soft 2s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'voice-pulse': 'voice-pulse 0.6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-soft': 'spin-soft 1s linear infinite',
      },

      // ========== TRANSITIONS ==========
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ========== GRADIENTS ==========
      backgroundImage: {
        'gradient-nurtura': 'radial-gradient(1200px circle at 6% -10%, rgba(252, 231, 216, 0.85) 0%, rgba(252, 231, 216, 0) 45%), radial-gradient(900px circle at 100% 0%, rgba(223, 243, 238, 0.9) 0%, rgba(223, 243, 238, 0) 50%), linear-gradient(180deg, #fff9f4 0%, #f6fbfa 100%)',
        'gradient-calm': 'linear-gradient(135deg, rgba(47, 111, 109, 0.05) 0%, rgba(229, 140, 107, 0.05) 100%)',
      },

      // ========== Z-INDEX ==========
      zIndex: {
        'bottom': '-10',
        'auto': 'auto',
        'base': '0',
        'sticky': '20',
        'fixed': '30',
        'modal-bg': '40',
        'modal': '50',
        'toast': '60',
        'tooltip': '70',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        abyss: '#0f172a',
        neon: '#38bdf8',
        violetNova: '#8b5cf6',
      },
      boxShadow: {
        neon: '0 0 34px rgba(56, 189, 248, 0.22), 0 0 56px rgba(139, 92, 246, 0.12)',
        glass: '0 18px 60px rgba(2, 6, 23, 0.42)',
        glow: '0 0 26px rgba(34, 211, 238, 0.18)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        orbitSlow: 'orbitSlow 18s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 22px rgba(56, 189, 248, 0.18)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.35)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbitSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};

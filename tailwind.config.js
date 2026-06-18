/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#f0f0f5',
          100: '#d8d8e0',
          200: '#9898a8',
          300: '#6b6b7b',
          400: '#3a3a4a',
          500: '#1c1c28',
          600: '#16161f',
          700: '#111118',
          800: '#0d0d14',
          900: '#0a0a0f',
        },
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6b2b',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          blue: '#3b82f6',
          saffron: '#ff6b2b',
        }
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spinSlow 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glow-saffron': '0 0 60px rgba(255, 107, 43, 0.15), 0 0 120px rgba(255, 107, 43, 0.05)',
        'glow-blue': '0 0 60px rgba(59, 130, 246, 0.15), 0 0 120px rgba(59, 130, 246, 0.05)',
        'glow-saffron-lg': '0 0 80px rgba(255, 107, 43, 0.25), 0 0 160px rgba(255, 107, 43, 0.1)',
      },
    },
  },
  plugins: [],
}

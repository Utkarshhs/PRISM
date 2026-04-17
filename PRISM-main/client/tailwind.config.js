/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        prism: {
          bg: '#0a0f1e',
          surface: '#111827',
          card: '#1a2235',
          border: '#1e293b',
          accent: '#3b82f6',
          green: '#22c55e',
          yellow: '#eab308',
          red: '#ef4444',
        },
        feature: {
          battery_life: '#3b82f6',
          packaging: '#f59e0b',
          build_quality: '#8b5cf6',
          customer_support: '#10b981',
          delivery_speed: '#06b6d4',
          value_for_money: '#f97316',
          performance: '#ec4899',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'count-up': 'countUp 1s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59,130,246,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(59,130,246,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

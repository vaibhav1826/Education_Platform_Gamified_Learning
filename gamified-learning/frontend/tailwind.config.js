export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8b5cf6',
        accent: '#22d3ee',
        neon: '#00f5d4',
        midnight: '#050816',
        'surface-dark': '#0b1220'
      },
      fontFamily: {
        sans: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Sora', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 35px rgba(34,211,238,0.25)',
        'glass-card': '0 20px 60px rgba(3,7,18,0.55)'
      },
      dropShadow: {
        glow: '0 0 20px rgba(139,92,246,0.55)'
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        'lux-gradient': 'linear-gradient(135deg, #101828 0%, #1f1544 45%, #050816 100%)'
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 2.4s linear infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.65, boxShadow: '0 0 20px rgba(0,245,212,0.25)' },
          '50%': { opacity: 1, boxShadow: '0 0 35px rgba(139,92,246,0.45)' }
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        shine: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' }
        }
      }
    }
  },
  plugins: []
};
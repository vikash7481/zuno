/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F1F7F2',
          100: '#E0EDE2',
          200: '#C2DCC6',
          300: '#9BC4A1',
          400: '#6FA777',
          500: '#468650',
          600: '#2D5A27',
          700: '#1E3F20', // Primary deep green
          800: '#142C16',
          900: '#0C1B0E',
        },
        gold: {
          50: '#FDFCF7',
          100: '#FAF5E3',
          200: '#F3E7BA',
          300: '#EBD58C',
          400: '#E0C05D',
          500: '#D4AF37', // Warm gold
          600: '#B8860B',
          700: '#8C6708',
          800: '#614705',
          900: '#3D2D03',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF7F2',
          300: '#F4EFE6',
          400: '#EBE3D5',
          500: '#DFCDB8',
        },
        charcoal: {
          800: '#1E2320',
          900: '#121513',
          950: '#0A0D0B',
        },
        qcGreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#0C831F', // Signature Zepto Add Button Green
          800: '#0A6C19',
        },
        qcPurple: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          600: '#892CDC',
          700: '#52057B',
          800: '#3E006B',
          900: '#2E0249',
        },
        qcYellow: {
          400: '#FACC15',
          500: '#EAB308',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(30, 63, 32, 0.06), 0 2px 6px -1px rgba(30, 63, 32, 0.04)',
        'luxury': '0 10px 30px -5px rgba(30, 63, 32, 0.1), 0 4px 10px -2px rgba(30, 63, 32, 0.05)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FCE7F3',
          DEFAULT: '#F9A8D4',
          dark: '#DB2777'
        },
        secondary: {
          light: '#CCFBF1',
          DEFAULT: '#5EEAD4',
          dark: '#0D9488'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
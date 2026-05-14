/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0B0E',
          900: '#111114',
          800: '#1A1A1F',
          700: '#26262D',
          600: '#3A3A44',
          500: '#5A5A66',
          400: '#8A8A95',
          300: '#B8B8C0',
          200: '#D8D8DE',
          100: '#EFEFF2',
        },
        accent: {
          DEFAULT: '#E8C547',
          dark: '#C9A626',
          soft: '#F5E5A3',
        },
        spice: '#E55934',
        forest: '#5A9367',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: '#0088cc',
          'blue-dark': '#006699',
          'blue-light': '#54a9eb',
          bg: '#17212b',
          'bg-light': '#232e3c',
          'bg-lighter': '#2b5278',
          text: '#ffffff',
          'text-secondary': '#708499',
          green: '#4fae4e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

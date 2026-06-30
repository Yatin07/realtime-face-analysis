/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        theme: {
          bg: '#0E0F0C',
          card: '#131410',
          border: '#2A2D24',
          lime: '#9FE870',
          text: '#0E0F0C',
          secondaryBorder: '#5C6354',
          olive: '#6e7063',
          rust: '#a85332',
        }
      }
    },
  },
  plugins: [],
}

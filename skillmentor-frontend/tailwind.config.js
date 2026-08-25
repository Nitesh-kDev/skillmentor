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
          50: '#F0F7FF',
          100: '#E0EFFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}

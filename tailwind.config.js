/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plotGreen: {
          light: '#E8F5E9',
          primary: '#2E7D32',
          dark: '#1B5E20'
        },
        plotNavy: {
          light: '#283593',
          DEFAULT: '#0F172A',
          dark: '#0A0F1D'
        },
        plotGold: '#D97706'
      }
    },
  },
  plugins: [],
}

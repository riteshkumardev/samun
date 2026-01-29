/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'print': {'raw': 'print'}, // Printing ke liye special screen size
        'xs': '400px',             // Chote mobile phones ke liye extra breakpoint
      },
      animation: {
        'shine': 'shine 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px rgba(37, 99, 235, 0.5)',
        'pro': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
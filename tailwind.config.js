/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "pet-blue": "#1E3A8A",
        "pet-orange": "#F97316",
        "pet-pink": "#FBCFE8"
      }
    },
  },
  plugins: [],
}

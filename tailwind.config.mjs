/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
  extend: {},
  screens: {
    xs: '480px',    // אופציונלי
    sm: '640px',
    md: '768px',
    lg: '1000px',
    xl: '1025px',
    '2xl': '1800px',
  },
},

  plugins: [
    require('@tailwindcss/typography'),
  ],
}

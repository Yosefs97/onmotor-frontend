/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        om: {
          void: "#050505",
          carbon: "#0b0b0d",
          asphalt: "#111114",
          steel: "#1c1c22",
          chrome: "#c7c7cc",
          mist: "#8a8a93",
          ember: "#ff3b00",
          blaze: "#ff6a00",
          blood: "#e10600",
          signal: "#ff1a1a",
        },
      },
      fontFamily: {
        display: ["Heebo", "system-ui", "sans-serif"],
        body: ["Heebo", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        racing: "0.22em",
        tightish: "-0.03em",
      },
      boxShadow: {
        ember: "0 8px 32px rgba(255, 59, 0, 0.28)",
        header: "0 12px 40px rgba(0, 0, 0, 0.65)",
      },
      backgroundImage: {
        "om-header":
          "linear-gradient(180deg, #111114 0%, #0b0b0d 72%, #080809 100%)",
      },
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1000px",
      xl: "1025px",
      "2xl": "1800px",
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
  ],
}

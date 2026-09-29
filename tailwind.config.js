/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        charcoal: "#545454",
        slate: {
          DEFAULT: "#69747C",
          grey: "#69747C",
          muted: "#9AA4AF",
        },
        sage: "#6BAA75",
        grass: "#84DD63",
        chartreuse: "#CBFF4D",
        cream: "#F7F6ED",
        darkbg: "#1A1C1E",
        darkcard: "#24272A",
      },
    },
  },
  plugins: [],
};

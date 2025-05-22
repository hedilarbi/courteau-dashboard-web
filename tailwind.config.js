/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      roboto: ["var(--font-roboto)"],
      montserrat: ["var(--font-montserrat)"],
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        default: "rgba(0, 0, 0, 0.3) 0px 3px 8px",
      },
      colors: {
        pr: "#F7A600",
        "text-light-gray": "#666666",
        "text-dark-gray": "#333333",
        "primary-blue": "#5180EC",
        "warning-red": "#E21C4A",
        "light-warning-red": "#FFE4E6",
        "border-color": "#D4E2E8",
      },
    },
  },
  plugins: [],
};

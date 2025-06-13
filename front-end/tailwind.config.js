/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette from design
        derma: {
          rose: "#FFDCDC", // Light pink/rose
          cream: "#FFF2EB", // Very light peach/cream
          peach: "#FFE8CD", // Light peach/orange
          salmon: "#FFD6BA", // Peach/salmon
        },
        // Semantic color mapping
        primary: {
          50: "#FFF2EB", // cream
          100: "#FFE8CD", // peach
          200: "#FFD6BA", // salmon
          300: "#FFDCDC", // rose
          400: "#FFB8A3", // darker salmon
          500: "#FF9B7A", // main primary
          600: "#FF7A52", // darker primary
          700: "#E85A2B", // dark primary
          800: "#C44A1F", // darker
          900: "#9A3412", // darkest
        },
        secondary: {
          50: "#FFDCDC", // rose
          100: "#FFB8B8", // darker rose
          200: "#FF9494", // medium rose
          300: "#FF7070", // darker rose
          400: "#FF4C4C", // red-rose
          500: "#FF2828", // main secondary
          600: "#E01E1E", // darker
          700: "#C11414", // dark
          800: "#A20A0A", // darker
          900: "#830000", // darkest
        },
      },
    },
  },
  plugins: [],
};

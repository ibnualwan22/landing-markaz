import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        markaz: {
          gold: "#FFCF40",
          "gold-hover": "#F2BC1B",
          "gold-deep": "#8A6100",
          "gold-tint": "#FFF9E6",
          white: "#FFFFFF",
          alabaster: "#FAF7F0",
          ink: "#171614",
          stone: "#57534E",
          muted: "#78716C",
          border: "#E7E2D8",
          "border-strong": "#D6CFC2",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;


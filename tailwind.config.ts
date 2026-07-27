import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#4A2C40", // deep plum / aubergine
        accent: "#D9A5A0", // warm rosé / blush
        background: "#FAF7F2", // soft ivory
        surface: "#FFFFFF",
        ink: "#2B2B2B", // text primary (charcoal)
        muted: "#7A7A7A", // text secondary (warm grey)
        success: "#6B8E6B", // sage
        danger: "#C0554E", // muted red
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(43, 43, 43, 0.06)",
        elevated: "0 8px 24px rgba(43, 43, 43, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;

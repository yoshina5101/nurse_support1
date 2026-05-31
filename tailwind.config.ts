import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 信頼感のあるティール（医療・清潔感）。やや柔らかめに調整。
        brand: {
          50: "#f0faf7",
          100: "#d6f1e9",
          200: "#aee3d4",
          300: "#7dcebb",
          400: "#4bb39e",
          500: "#2a9d87",
          600: "#1c8071",
          700: "#18675c",
          800: "#16524a",
          900: "#13443e",
        },
        // 温かみのあるコーラル（人のあたたかさ・看護のやさしさ）。
        accent: {
          50: "#fff5f1",
          100: "#ffe6dc",
          200: "#ffc9b6",
          300: "#ffa585",
          400: "#ff8159",
          500: "#f96a3d",
          600: "#e5512a",
          700: "#be3f20",
          800: "#983620",
          900: "#7c301f",
        },
        // クリーム系の温かいニュートラル。
        cream: {
          50: "#fdfbf7",
          100: "#faf6ef",
          200: "#f3ebdd",
        },
      },
      fontFamily: {
        sans: [
          "Hiragino Maru Gothic ProN",
          "Hiragino Kaku Gothic ProN",
          "BIZ UDPGothic",
          "Meiryo",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(28, 128, 113, 0.10), 0 4px 16px -4px rgba(0,0,0,0.06)",
        "soft-lg":
          "0 8px 24px -6px rgba(28, 128, 113, 0.14), 0 12px 32px -8px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

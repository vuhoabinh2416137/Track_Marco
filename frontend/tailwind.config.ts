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
        background: "#090A0F",
        card: "#12141D",
        "card-hover": "#1A1D2A",
        border: "#1E2235",
        brand: {
          blue: "#3B82F6",
          cyan: "#06B6D4",
          purple: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        macro: {
          calories: "#F97316", // Cam tươi năng lượng
          protein: "#3B82F6",  // Xanh dương cơ bắp
          carbs: "#10B981",    // Xanh lá bền bỉ
          fat: "#F59E0B",      // Vàng mật ong
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounce 2s infinite",
      }
    },
  },
  plugins: [],
};
export default config;

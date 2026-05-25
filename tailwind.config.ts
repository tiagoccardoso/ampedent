import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          DEFAULT: "#0e7490",
          dark: "#005a71",
          light: "#b9eaff",
          muted: "#81d1f0",
        },
        mint: {
          DEFAULT: "#10b981",
          dark: "#006c49",
          light: "#dcfce7",
        },
        surface: {
          DEFAULT: "#f8f9ff",
          white: "#ffffff",
          muted: "#f9fafb",
          container: "#e5eeff",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#64748b",
          light: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        modal: "0 8px 32px rgba(0,0,0,0.12)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

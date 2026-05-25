import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Stitch "Clinical Precision" design tokens
      colors: {
        clinical: {
          primary:        "#0E7490",
          "primary-dark": "#005a71",
          "primary-light":"#b9eaff",
          "primary-dim":  "#81d1f0",
          secondary:      "#006c49",
          "secondary-lt": "#6cf8bb",
          surface:        "#f8f9ff",
          "surface-lo":   "#eff4ff",
          "surface-mid":  "#e5eeff",
          white:          "#FFFFFF",
          muted:          "#F9FAFB",
          "border-soft":  "#E5E7EB",
          "text-main":    "#0F172A",
          "text-body":    "#0b1c30",
          "text-muted":   "#64748B",
          "text-variant": "#3f484c",
          error:          "#ba1a1a",
          "error-lt":     "#ffdad6",
          "error-dk":     "#93000a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
        btn:  "0.5rem",
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

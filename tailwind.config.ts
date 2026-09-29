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
        background: "#FAFAFA",
        "background-secondary": "#F5F5F0",
        "primary-text": "#1A1A1A",
        "secondary-text": "#6B6B6B",
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
        },
        destructive: "#DC2626",
        success: "#16A34A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        drawer: "-4px 0 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;

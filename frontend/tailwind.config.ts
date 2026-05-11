import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f7f1",
          100: "#e6ecdf",
          300: "#aebf9d",
          500: "#718766",
          700: "#485942"
        },
        clay: {
          100: "#f0dfd6",
          400: "#c78f7e",
          600: "#915c52"
        },
        ink: "#28302b"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(40, 48, 43, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;

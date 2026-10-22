import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f3f6f4",
          100: "#e2eae4",
          700: "#2c3d34",
          800: "#1c2a24",
          900: "#121c18",
        },
        copper: {
          50: "#fbf4ee",
          400: "#e08a4f",
          500: "#c45c26",
          600: "#a64b1d",
        },
        paper: {
          50: "#fbf8f2",
          100: "#f4f0e6",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 28, 24, 0.06), 0 12px 28px rgba(18, 28, 24, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

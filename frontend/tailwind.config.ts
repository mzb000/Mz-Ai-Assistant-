import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          50: "#e0faff",
          100: "#b3f0ff",
          200: "#80e5ff",
          300: "#4dd9ff",
          400: "#26ceff",
          500: "#00c3ff",
          600: "#009fcc",
          700: "#007a99",
          800: "#005566",
          900: "#003033",
        },
        background: "#0a0a0f",
        surface: "#12121a",
        surface2: "#1a1a2e",
        border: "#2a2a3e",
        muted: "#8888a0",
        foreground: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "voice-wave": "voice-wave 1.5s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "voice-wave": {
          "0%, 100%": { height: "4px" },
          "50%": { height: "20px" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 195, 255, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 195, 255, 0.8)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

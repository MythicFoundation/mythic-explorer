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
        mythic: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#1e1e2e",
          green: "#39FF14",
          "green-dim": "#2ACC10",
          "green-light": "#6FFF4F",
          purple: "#7c3aed",
          cyan: "#06b6d4",
          text: "#e2e2e8",
          muted: "#8888a0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
};

export default config;

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
          violet: "#7B2FFF",
          "violet-bright": "#9B5FFF",
          "violet-deep": "#5A1FCC",
          green: "#39FF14",
        },
        bg: {
          0: "#0A0A12",
          1: "#12121C",
          2: "#1A1A28",
          3: "#222234",
          4: "#2A2A40",
        },
        text: {
          100: "#FFFFFF",
          200: "#E0E0E8",
          300: "#A0A0B0",
          400: "#686878",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        none: "0px",
      },
    },
  },
  plugins: [],
};

export default config;
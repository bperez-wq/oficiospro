import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#08746f",
          dark: "#066b65",
          deep: "#04413e",
          soft: "#dff4ef",
          mist: "#eef9f5",
        },
        accent: {
          DEFAULT: "#2f6fed",
          dark: "#1d4ed8",
          soft: "#e9f1ff",
        },
        sun: {
          DEFAULT: "#f2a93b",
          dark: "#d98a24",
          soft: "#fff3dc",
        },
        mint: "#e7f7f0",
        sand: "#f6f3ec",
        ink: "#14201f",
        muted: "#2c3a38",
        line: "rgba(20, 32, 31, 0.12)",
        enterprise: "#102b2b",
        gold: "#d98a24",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(11, 45, 47, 0.1)",
        card: "0 12px 34px rgba(11, 45, 47, 0.12)",
        lift: "0 24px 60px rgba(11, 45, 47, 0.18)",
        glow: "0 18px 42px rgba(8, 116, 111, 0.35)",
        "glow-sun": "0 16px 40px rgba(217, 130, 26, 0.3)",
      },
      borderRadius: {
        panel: "18px",
        card: "24px",
        xl2: "28px",
      },
      backgroundImage: {
        "grid-soft":
          "linear-gradient(rgba(8,116,111,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(8,116,111,0.06) 1px, transparent 1px)",
        "brand-gradient": "linear-gradient(135deg, #08746f 0%, #064f4b 100%)",
        "enterprise-gradient": "linear-gradient(150deg, #123433 0%, #0a2422 55%, #08302d 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

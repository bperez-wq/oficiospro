import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#08746f",
          dark: "#064f4b",
          soft: "#dff4ef",
        },
        ink: "#142024",
        muted: "#617077",
        line: "#dbe6e8",
        enterprise: "#102b2b",
        gold: "#d9982b",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(11, 45, 47, 0.1)",
        card: "0 12px 34px rgba(11, 45, 47, 0.12)",
      },
      borderRadius: {
        panel: "18px",
      },
    },
  },
  plugins: [],
};

export default config;

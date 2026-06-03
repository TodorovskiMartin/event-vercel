import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0b10",
        stage: "#12141c",
        brass: "#d6a94a",
        neon: "#4dd0e1",
        rose: "#e05a7a"
      }
    }
  },
  plugins: []
};

export default config;
